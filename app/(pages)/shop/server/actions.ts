'use server'

import type { Currency, OrderStatus, ProductVariant } from '@prisma/client'
import slugify from 'slugify'
import type { TransformedProductData } from '@/app/(pages)/admin/add-product/product-add-schema'
import { withPrisma } from '@/prisma/prismaClient'
import { saveProductImages } from '@/server/files/images'
import { stripe } from '@/services/stripe'

interface CreateCheckoutSessionInput {
  userId: string
  items: Array<{
    variantId: string
    quantity: number
  }>
  currency: Currency
  shippingAddress: {
    firstName: string
    lastName: string
    email: string
    phone?: string
    address: string
    city: string
    state?: string
    postalCode: string
    country: string
  }
}

/**
 * Create a product with variants in Stripe and local database
 */
export const createProductWithVariants = withPrisma(
  async (prisma, input: TransformedProductData) => {
    try {
      // Save images to storage
      const savedImages = await saveProductImages(input.images)

      // Create product in Stripe
      const stripeProduct = await stripe.products.create({
        name: input.name,
        description: input.description,
      })

      const slug = slugify(input.name, { lower: true, strict: true })

      // Create product in database
      const product = await prisma.product.create({
        data: {
          name: input.name,
          slug,
          description: input.description,
          stripeProductId: stripeProduct.id,
          isActive: true,
          images: savedImages.length > 0 ? { createMany: { data: savedImages } } : undefined,
          options:
            input.options.length > 0
              ? {
                  createMany: {
                    data: input.options.map(opt => ({
                      name: opt.name,
                      values: opt.values,
                      position: opt.position,
                    })),
                  },
                }
              : undefined,
        },
      })

      // Create variants with Stripe prices
      const createdVariants: ProductVariant[] = []

      for (const variant of input.variants) {
        let stripePriceIdEUR: string | undefined
        let stripePriceIdUSD: string | undefined

        // Create Stripe prices for each variant
        if (variant.priceEUR) {
          const priceEUR = await stripe.prices.create({
            product: stripeProduct.id,
            unit_amount: variant.priceEUR,
            currency: 'eur',
            metadata: { sku: variant.sku },
          })
          stripePriceIdEUR = priceEUR.id
        }

        if (variant.priceUSD) {
          const priceUSD = await stripe.prices.create({
            product: stripeProduct.id,
            unit_amount: variant.priceUSD,
            currency: 'usd',
            metadata: { sku: variant.sku },
          })
          stripePriceIdUSD = priceUSD.id
        }

        // Create variant in database
        const createdVariant = await prisma.productVariant.create({
          data: {
            productId: product.id,
            sku: variant.sku,
            options: variant.options,
            priceEUR: variant.priceEUR,
            priceUSD: variant.priceUSD,
            stock: variant.stock,
            weight: variant.weight,
            stripePriceIdEUR,
            stripePriceIdUSD,
            isActive: true,
          },
        })

        createdVariants.push(createdVariant)
      }

      return {
        success: true,
        product: { ...product, variants: createdVariants },
      }
    } catch (error) {
      console.error('Error creating product with variants:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  },
)

/**
 * Create Stripe Checkout Session (works with variants)
 */
export const createCheckoutSession = withPrisma(
  async (prisma, input: CreateCheckoutSessionInput) => {
    try {
      // Get or create customer
      let customer = await prisma.customer.findUnique({
        where: { userId: input.userId },
        include: { user: true },
      })

      if (!customer) {
        const user = await prisma.user.findUnique({
          where: { id: input.userId },
        })

        if (!user) {
          return { success: false, error: 'User not found' }
        }

        // Create Stripe customer first, then save to DB
        let stripeCustomer: { id: string }
        try {
          stripeCustomer = await stripe.customers.create({
            email: user.email,
            name: user.name,
            metadata: { userId: user.id },
          })
        } catch (error) {
          console.error('Failed to create Stripe customer:', error)
          return {
            success: false,
            error: 'Failed to create customer in payment system',
          }
        }

        // Create customer in database
        try {
          customer = await prisma.customer.create({
            data: {
              userId: user.id,
              stripeCustomerId: stripeCustomer.id,
            },
            include: { user: true },
          })
        } catch (error) {
          // Rollback: delete Stripe customer if DB creation fails
          console.error('Failed to save customer to database, rolling back Stripe customer:', error)
          try {
            await stripe.customers.del(stripeCustomer.id)
          } catch (deleteError) {
            console.error('Failed to delete Stripe customer during rollback:', deleteError)
          }
          return {
            success: false,
            error: 'Failed to create customer',
          }
        }
      }

      // Validate variants and calculate total
      const stockCheck = await prisma.$transaction(async tx => {
        const variants = await tx.productVariant.findMany({
          where: {
            id: { in: input.items.map(item => item.variantId) },
          },
          include: { product: true },
        })

        // Check stock availability
        for (const item of input.items) {
          const variant = variants.find(v => v.id === item.variantId)
          if (!variant) {
            throw new Error(`Variant ${item.variantId} not found`)
          }
          if (!variant.isActive || !variant.product.isActive) {
            throw new Error(`Product ${variant.product.name} is not available`)
          }
          if (variant.stock < item.quantity) {
            throw new Error(
              `Insufficient stock for ${variant.product.name} (${JSON.stringify(variant.options)}). Available: ${variant.stock}`,
            )
          }
        }

        return variants
      })

      const variants = stockCheck

      // Create shipping address
      const shippingAddress = await prisma.shippingAddress.create({
        data: input.shippingAddress,
      })

      // Calculate totals
      const subtotal = input.items.reduce((sum, item) => {
        const variant = variants.find(v => v.id === item.variantId)
        if (!variant) return sum
        const price = input.currency === 'EUR' ? variant.priceEUR : variant.priceUSD
        return sum + (price || 0) * item.quantity
      }, 0)

      const shippingCost = 0 // TODO: Calculate shipping cost
      const tax = 0 // TODO: Calculate tax
      const total = subtotal + shippingCost + tax

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`

      // Create order
      const order = await prisma.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          shippingAddressId: shippingAddress.id,
          status: 'PENDING',
          currency: input.currency,
          subtotal,
          shippingCost,
          tax,
          total,
        },
        include: { items: true },
      })

      // Create order items separately
      for (const item of input.items) {
        const variant = variants.find(v => v.id === item.variantId)
        if (!variant) throw new Error(`Variant ${item.variantId} not found`)
        const price = input.currency === 'EUR' ? variant.priceEUR : variant.priceUSD

        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: variant.productId,
            variantId: variant.id,
            quantity: item.quantity,
            priceAtTime: price || 0,
            currency: input.currency,
            variantInfo: variant.options as Record<string, string>,
          },
        })
      }

      // Create Stripe Checkout Session
      const lineItems = input.items.map(item => {
        const variant = variants.find(v => v.id === item.variantId)
        const priceId =
          input.currency === 'EUR' ? variant?.stripePriceIdEUR : variant?.stripePriceIdUSD

        if (!priceId) {
          throw new Error(`Price not found for variant ${variant?.sku} in ${input.currency}`)
        }

        return {
          price: priceId,
          quantity: item.quantity,
        }
      })

      const session = await stripe.checkout.sessions.create({
        customer: customer.stripeCustomerId,
        line_items: lineItems,
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/shop/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/shop/checkout/cancel`,
        metadata: { orderId: order.id },
        shipping_address_collection: {
          allowed_countries: ['US', 'CA', 'GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE'],
        },
      })

      // Update order with session ID
      await prisma.order.update({
        where: { id: order.id },
        data: { stripeSessionId: session.id },
      })

      return {
        success: true,
        sessionUrl: session.url,
        orderId: order.id,
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  },
)

/**
 * Update order status
 */
export const updateOrderStatus = withPrisma(
  async (prisma, orderId: string, status: OrderStatus, trackingNumber?: string) => {
    try {
      const data: {
        status: OrderStatus
        trackingNumber?: string
        shippedAt?: Date
        deliveredAt?: Date
        cancelledAt?: Date
      } = { status }

      if (trackingNumber) {
        data.trackingNumber = trackingNumber
      }

      if (status === 'SHIPPED') {
        data.shippedAt = new Date()
      } else if (status === 'DELIVERED') {
        data.deliveredAt = new Date()
      } else if (status === 'CANCELLED') {
        data.cancelledAt = new Date()
      }

      const order = await prisma.order.update({
        where: { id: orderId },
        data,
      })

      return { success: true, order }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unable to update order',
      }
    }
  },
)
