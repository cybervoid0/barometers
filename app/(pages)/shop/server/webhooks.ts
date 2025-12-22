import type Stripe from 'stripe'
import { withPrisma } from '@/prisma/prismaClient'

/**
 * Handle checkout.session.completed event
 * Uses transaction to ensure atomicity
 */
export const handleCheckoutSessionCompleted = withPrisma(
  async (prisma, session: Stripe.Checkout.Session) => {
    const orderId = session.metadata?.orderId

    if (!orderId) {
      console.error('No orderId in session metadata')
      return
    }

    try {
      // Use transaction to ensure all operations succeed or fail together
      await prisma.$transaction(async tx => {
        // Check if already processed (idempotency)
        const existingOrder = await tx.order.findUnique({
          where: { id: orderId },
          select: { status: true },
        })

        if (existingOrder?.status === 'PAID') {
          console.log(`Order ${orderId} already processed, skipping`)
          return
        }

        // Extract payment intent ID (can be string, object, or null)
        const paymentIntentId =
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id

        if (!paymentIntentId) {
          console.error(`No payment_intent in session ${session.id}`)
          return
        }

        // Update order status
        await tx.order.update({
          where: { id: orderId },
          data: {
            status: 'PAID',
            stripePaymentIntentId: paymentIntentId,
          },
        })

        // Create payment record (upsert for idempotency)
        await tx.payment.upsert({
          where: { stripePaymentIntentId: paymentIntentId },
          create: {
            orderId,
            stripePaymentIntentId: paymentIntentId,
            amount: session.amount_total || 0,
            currency: session.currency?.toUpperCase() as 'EUR' | 'USD',
            status: 'SUCCEEDED',
            paidAt: new Date(),
          },
          update: {
            status: 'SUCCEEDED',
            paidAt: new Date(),
          },
        })

        // Decrease stock for ordered items (on variants)
        const order = await tx.order.findUnique({
          where: { id: orderId },
          include: { items: true },
        })

        if (order) {
          for (const item of order.items) {
            // Update variant stock if variantId exists
            if (item.variantId) {
              await tx.productVariant.update({
                where: { id: item.variantId },
                data: {
                  stock: {
                    decrement: item.quantity,
                  },
                },
              })
            }
          }
        }
      })

      console.log(`Order ${orderId} marked as PAID`)
    } catch (error) {
      console.error('Error handling checkout.session.completed:', error)
      throw error
    }
  },
)

/**
 * Handle checkout.session.expired event
 */
export const handleCheckoutSessionExpired = withPrisma(
  async (prisma, session: Stripe.Checkout.Session) => {
    const orderId = session.metadata?.orderId

    if (!orderId) {
      console.error('No orderId in session metadata')
      return
    }

    try {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
        },
      })

      console.log(`Order ${orderId} marked as CANCELLED (session expired)`)
    } catch (error) {
      console.error('Error handling checkout.session.expired:', error)
      throw error
    }
  },
)

/**
 * Handle payment_intent.payment_failed event
 * Uses transaction to ensure atomicity
 */
export const handlePaymentIntentFailed = withPrisma(
  async (prisma, paymentIntent: Stripe.PaymentIntent) => {
    try {
      const order = await prisma.order.findUnique({
        where: { stripePaymentIntentId: paymentIntent.id },
      })

      if (!order) {
        console.error(`Order not found for payment intent ${paymentIntent.id}`)
        return
      }

      // Use transaction to ensure all operations succeed or fail together
      await prisma.$transaction(async tx => {
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: 'CANCELLED',
            cancelledAt: new Date(),
          },
        })

        // Update or create payment record
        const existingPayment = await tx.payment.findUnique({
          where: { stripePaymentIntentId: paymentIntent.id },
        })

        if (existingPayment) {
          await tx.payment.update({
            where: { stripePaymentIntentId: paymentIntent.id },
            data: {
              status: 'FAILED',
              failureMessage: paymentIntent.last_payment_error?.message,
            },
          })
        } else {
          await tx.payment.create({
            data: {
              orderId: order.id,
              stripePaymentIntentId: paymentIntent.id,
              amount: paymentIntent.amount,
              currency: paymentIntent.currency.toUpperCase() as 'EUR' | 'USD',
              status: 'FAILED',
              failureMessage: paymentIntent.last_payment_error?.message,
            },
          })
        }
      })

      console.log(`Payment failed for order ${order.id}`)
    } catch (error) {
      console.error('Error handling payment_intent.payment_failed:', error)
      throw error
    }
  },
)

/**
 * Handle charge.refunded event
 * Uses transaction to ensure atomicity
 */
export const handleChargeRefunded = withPrisma(async (prisma, charge: Stripe.Charge) => {
  try {
    // Extract payment intent ID (can be string, object, or null)
    const paymentIntentId =
      typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id

    if (!paymentIntentId) {
      console.error(`No payment_intent in charge ${charge.id}`)
      return
    }

    const order = await prisma.order.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
      include: { items: true },
    })

    if (!order) {
      console.error(`Order not found for payment intent ${paymentIntentId}`)
      return
    }

    // Use transaction to ensure all operations succeed or fail together
    await prisma.$transaction(async tx => {
      // Check if already processed (idempotency)
      if (order.status === 'REFUNDED') {
        console.log(`Order ${order.id} already refunded, skipping`)
        return
      }

      // Check if full refund (Stripe sends amount_refunded in cents)
      const isFullRefund = charge.amount_refunded === charge.amount

      // Update order status only if full refund
      if (isFullRefund) {
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: 'REFUNDED',
          },
        })
      }

      // Update payment record
      await tx.payment.update({
        where: { stripePaymentIntentId: paymentIntentId },
        data: {
          status: isFullRefund ? 'REFUNDED' : 'SUCCEEDED',
          refundedAt: new Date(),
          refundAmount: charge.amount_refunded,
        },
      })

      // Restore stock only for full refund (on variants)
      if (isFullRefund) {
        for (const item of order.items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: {
                stock: {
                  increment: item.quantity,
                },
              },
            })
          }
        }
      }
    })

    console.log(`Order ${order.id} refunded`)
  } catch (error) {
    console.error('Error handling charge.refunded:', error)
    throw error
  }
})
