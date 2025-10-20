'use server'

import type { Currency, Product } from '@prisma/client'
import slugify from 'slugify'
import { withPrisma } from '@/prisma/prismaClient'
import { stripe } from '@/services/stripe'

interface CreateProductInput {
  name: string
  description?: string
  priceEUR?: number // in cents
  priceUSD?: number // in cents
  stock: number
  weight?: number // in grams
  dimensions?: {
    length?: number
    width?: number
    height?: number
  }
}

interface CreateCheckoutSessionInput {
  userId: string
  items: Array<{
    productId: string
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
 * Create a product in Stripe and local database
 */
export const createProduct = withPrisma(async (prisma, input: CreateProductInput) => {
  try {
    // Create product in Stripe
    const stripeProduct = await stripe.products.create({
      name: input.name,
      description: input.description,
      metadata: {
        stock: input.stock.toString(),
        weight: input.weight?.toString() || '',
      },
    })

    // Create prices in Stripe
    let stripePriceIdEUR: string | undefined
    let stripePriceIdUSD: string | undefined

    if (input.priceEUR) {
      const priceEUR = await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: input.priceEUR,
        currency: 'eur',
      })
      stripePriceIdEUR = priceEUR.id
    }

    if (input.priceUSD) {
      const priceUSD = await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: input.priceUSD,
        currency: 'usd',
      })
      stripePriceIdUSD = priceUSD.id
    }

    // Create product in database
    const product = await prisma.product.create({
      data: {
        name: input.name,
        slug: slugify(input.name, { lower: true, strict: true }),
        description: input.description,
        stripeProductId: stripeProduct.id,
        stripePriceIdEUR,
        stripePriceIdUSD,
        priceEUR: input.priceEUR,
        priceUSD: input.priceUSD,
        stock: input.stock,
        weight: input.weight,
        dimensions: input.dimensions,
        isActive: true,
      },
    })

    return { success: true, product }
  } catch (error) {
    console.error('Error creating product:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
})

/**
 * Update product in Stripe and local database
 */
export const updateProduct = withPrisma(
  async (prisma, productId: string, input: Partial<CreateProductInput>) => {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      })

      if (!product) {
        return { success: false, error: 'Product not found' }
      }

      // Update in Stripe
      await stripe.products.update(product.stripeProductId, {
        name: input.name,
        description: input.description,
        metadata: {
          stock: input.stock?.toString() || product.stock.toString(),
          weight: input.weight?.toString() || product.weight?.toString() || '',
        },
      })

      // Update prices if changed
      let updatedStripePriceIdEUR = product.stripePriceIdEUR
      let updatedStripePriceIdUSD = product.stripePriceIdUSD

      if (input.priceEUR && input.priceEUR !== product.priceEUR) {
        // Archive old price
        if (product.stripePriceIdEUR) {
          await stripe.prices.update(product.stripePriceIdEUR, {
            active: false,
          })
        }
        // Create new price
        const priceEUR = await stripe.prices.create({
          product: product.stripeProductId,
          unit_amount: input.priceEUR,
          currency: 'eur',
        })
        updatedStripePriceIdEUR = priceEUR.id
      }

      if (input.priceUSD && input.priceUSD !== product.priceUSD) {
        if (product.stripePriceIdUSD) {
          await stripe.prices.update(product.stripePriceIdUSD, {
            active: false,
          })
        }
        const priceUSD = await stripe.prices.create({
          product: product.stripeProductId,
          unit_amount: input.priceUSD,
          currency: 'usd',
        })
        updatedStripePriceIdUSD = priceUSD.id
      }

      // Update in database
      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: {
          name: input.name,
          slug: input.name ? slugify(input.name, { lower: true, strict: true }) : undefined,
          description: input.description,
          stripePriceIdEUR: updatedStripePriceIdEUR,
          stripePriceIdUSD: updatedStripePriceIdUSD,
          priceEUR: input.priceEUR,
          priceUSD: input.priceUSD,
          stock: input.stock,
          weight: input.weight,
          dimensions: input.dimensions,
        },
      })

      return { success: true, product: updatedProduct }
    } catch (error) {
      console.error('Error updating product:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  },
)

/**
 * Create Stripe Checkout Session
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
            metadata: {
              userId: user.id,
            },
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

      // Validate products and calculate total
      // Use transaction with optimistic locking to prevent race conditions
      const stockCheck = await prisma.$transaction(async tx => {
        const products = await tx.product.findMany({
          where: {
            id: { in: input.items.map(item => item.productId) },
          },
        })

        // Check stock availability
        for (const item of input.items) {
          const product = products.find((p: Product) => p.id === item.productId)
          if (!product) {
            throw new Error(`Product ${item.productId} not found`)
          }
          if (!product.isActive) {
            throw new Error(`Product ${product.name} is not available`)
          }
          if (product.stock < item.quantity) {
            throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`)
          }
        }

        return products
      })

      const products = stockCheck

      // NOTE: There's still a small race condition window here between stock check
      // and order creation. For production, consider implementing a reservation system
      // where stock is temporarily reserved during checkout.

      // Create shipping address
      const shippingAddress = await prisma.shippingAddress.create({
        data: input.shippingAddress,
      })

      // Calculate totals
      const subtotal = input.items.reduce((sum, item) => {
        const product = products.find((p: Product) => p.id === item.productId)
        if (!product) return sum
        const price = input.currency === 'EUR' ? product.priceEUR : product.priceUSD
        return sum + (price || 0) * item.quantity
      }, 0)

      // TODO: Calculate shipping cost based on weight/dimensions
      const shippingCost = 0
      const tax = 0
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
          items: {
            create: input.items.map(item => {
              const product = products.find((p: Product) => p.id === item.productId)
              const price = input.currency === 'EUR' ? product?.priceEUR : product?.priceUSD
              return {
                productId: item.productId,
                quantity: item.quantity,
                priceAtTime: price || 0,
              }
            }),
          },
        },
      })

      // Create Stripe Checkout Session
      const lineItems = input.items.map(item => {
        const product = products.find((p: Product) => p.id === item.productId)
        const priceId =
          input.currency === 'EUR' ? product?.stripePriceIdEUR : product?.stripePriceIdUSD

        if (!priceId) {
          throw new Error(`Price not found for product ${product?.name} in ${input.currency}`)
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
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/cancel`,
        metadata: {
          orderId: order.id,
        },
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
 * Get order by session ID
 */
export const getOrderBySessionId = withPrisma(async (prisma, sessionId: string) => {
  try {
    const order = await prisma.order.findUnique({
      where: { stripeSessionId: sessionId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
        customer: {
          include: {
            user: true,
          },
        },
      },
    })

    return { success: true, order }
  } catch (error) {
    console.error('Error getting order:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
})
