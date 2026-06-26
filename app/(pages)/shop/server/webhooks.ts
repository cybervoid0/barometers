import type Stripe from 'stripe'
import { prisma } from '@/prisma/prismaClient'
import { sendOrderAdminNotification } from '@/server/email/order-admin-notification'
import { sendOrderConfirmationEmail } from '@/server/email/order-confirmation'
import { stripe } from '@/services/stripe'
import { releasePendingOrder } from './order-lifecycle'

/**
 * Handle checkout.session.completed event
 * Uses transaction to ensure atomicity
 */
export async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId

  if (!orderId) {
    console.error('No orderId in session metadata')
    return
  }

  try {
    // Use transaction to ensure all operations succeed or fail together.
    // Returns true when the order was newly marked PAID (so we only send the
    // confirmation email once, even if Stripe retries the webhook).
    const newlyPaid = await prisma.$transaction(async tx => {
      // Check if already processed (idempotency)
      const existingOrder = await tx.order.findUnique({
        where: { id: orderId },
        select: { status: true },
      })

      // Only a still-PENDING order may be promoted to PAID. This both gives
      // idempotency (a retry sees PAID and skips) and refuses to resurrect an
      // order that was already CANCELLED/REFUNDED — e.g. one whose checkout was
      // rolled back but whose Stripe session somehow still got paid.
      if (existingOrder?.status !== 'PENDING') {
        console.log(
          `Order ${orderId} not PENDING (status: ${existingOrder?.status ?? 'missing'}) — skipping`,
        )
        return false
      }

      // Extract payment intent ID (can be string, object, or null)
      const paymentIntentId =
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id

      if (!paymentIntentId) {
        console.error(`No payment_intent in session ${session.id}`)
        return false
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
          currency: 'EUR',
          status: 'SUCCEEDED',
          paidAt: new Date(),
        },
        update: {
          status: 'SUCCEEDED',
          paidAt: new Date(),
        },
      })

      // Stock was already reserved when the checkout session was created (the
      // guarded decrement in createCheckoutSession). Decrementing again here
      // would double-count. Reserved stock is only released on
      // expiry/failure/refund.
      return true
    })

    console.log(`Order ${orderId} marked as PAID`)

    // Notify the customer and the shop admin outside the transaction — a mail
    // failure must never roll back a paid order nor fail the webhook (which would
    // trigger Stripe retries). allSettled swallows errors; idempotency keys
    // prevent duplicates on retries.
    if (newlyPaid) {
      await Promise.allSettled([
        sendOrderConfirmationEmail(orderId),
        sendOrderAdminNotification(orderId),
      ])
    }
  } catch (error) {
    console.error('Error handling checkout.session.completed:', error)
    throw error
  }
}

/**
 * Handle checkout.session.expired event
 */
export async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId

  if (!orderId) {
    console.error('No orderId in session metadata')
    return
  }

  try {
    await releasePendingOrder(orderId, 'session expired')
  } catch (error) {
    console.error('Error handling checkout.session.expired:', error)
    throw error
  }
}

/**
 * Handle payment_intent.payment_failed event
 * Uses payment intent metadata (orderId) for lookup, falling back to
 * stripePaymentIntentId field and then Stripe session lookup.
 */
export async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Try to find order via metadata first (most reliable)
    let order = paymentIntent.metadata?.orderId
      ? await prisma.order.findUnique({
          where: { id: paymentIntent.metadata.orderId },
        })
      : null

    // Fallback: find by stripePaymentIntentId (set after checkout.session.completed)
    if (!order) {
      order = await prisma.order.findUnique({
        where: { stripePaymentIntentId: paymentIntent.id },
      })
    }

    // Fallback: look up via Stripe checkout session
    if (!order) {
      const sessions = await stripe.checkout.sessions.list({
        payment_intent: paymentIntent.id,
        limit: 1,
      })
      const session = sessions.data[0]
      if (session?.metadata?.orderId) {
        order = await prisma.order.findUnique({
          where: { id: session.metadata.orderId },
        })
      }
    }

    if (!order) {
      console.error(`Order not found for payment intent ${paymentIntent.id}`)
      return
    }

    // Record the failed payment regardless of the order's current state.
    await prisma.payment.upsert({
      where: { stripePaymentIntentId: paymentIntent.id },
      update: {
        status: 'FAILED',
        failureMessage: paymentIntent.last_payment_error?.message,
      },
      create: {
        orderId: order.id,
        stripePaymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: 'EUR',
        status: 'FAILED',
        failureMessage: paymentIntent.last_payment_error?.message,
      },
    })

    // Cancel + release reserved stock only if the order is still PENDING, so a
    // failed retry can never revert an order another session already paid.
    await releasePendingOrder(order.id, 'payment failed')

    console.log(`Payment failed for order ${order.id}`)
  } catch (error) {
    console.error('Error handling payment_intent.payment_failed:', error)
    throw error
  }
}

/**
 * Handle charge.refunded event
 * Uses transaction to ensure atomicity — order is read inside the transaction
 * to prevent stale reads from concurrent webhook deliveries.
 */
export async function handleChargeRefunded(charge: Stripe.Charge) {
  try {
    // Extract payment intent ID (can be string, object, or null)
    const paymentIntentId =
      typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id

    if (!paymentIntentId) {
      console.error(`No payment_intent in charge ${charge.id}`)
      return
    }

    // Read order inside transaction to prevent stale reads
    await prisma.$transaction(async tx => {
      const order = await tx.order.findUnique({
        where: { stripePaymentIntentId: paymentIntentId },
        include: { items: true },
      })

      if (!order) {
        console.error(`Order not found for payment intent ${paymentIntentId}`)
        return
      }

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

      // Update payment record. Upsert (not update) so a refund of a charge
      // whose Payment row is somehow missing can't throw P2025 and wedge the
      // webhook into an endless retry loop.
      await tx.payment.upsert({
        where: { stripePaymentIntentId: paymentIntentId },
        update: {
          status: isFullRefund ? 'REFUNDED' : 'SUCCEEDED',
          refundedAt: new Date(),
          refundAmount: charge.amount_refunded,
        },
        create: {
          orderId: order.id,
          stripePaymentIntentId: paymentIntentId,
          amount: charge.amount,
          currency: 'EUR',
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

      console.log(`Order ${order.id} refunded`)
    })
  } catch (error) {
    console.error('Error handling charge.refunded:', error)
    throw error
  }
}
