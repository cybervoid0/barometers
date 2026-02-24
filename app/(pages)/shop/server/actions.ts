'use server'

import type { Currency, OrderStatus, ProductVariant } from '@prisma/client'
import { getServerSession } from 'next-auth'
import slugify from 'slugify'
import type { TransformedProductData } from '@/app/(pages)/admin/add-product/product-add-schema'
import { prisma } from '@/prisma/prismaClient'
import { saveImage } from '@/server/files/images'
import { authConfig } from '@/services/auth'
import { stripe } from '@/services/stripe'
import { ImageType } from '@/types'

// --- Auth helpers ---

async function requireAuth() {
  const session = await getServerSession(authConfig)
  if (!session?.user?.id) {
    return null
  }
  return session
}

async function requireAdmin() {
  const session = await getServerSession(authConfig)
  if (!session?.user?.role || !['ADMIN', 'OWNER'].includes(session.user.role)) {
    return null
  }
  return session
}

// --- Checkout types ---

interface CreateCheckoutSessionInput {
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

// --- Order status transitions ---

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PAID', 'CANCELLED'],
  PAID: ['PROCESSING', 'CANCELLED', 'REFUNDED'],
  PROCESSING: ['SHIPPED', 'CANCELLED', 'REFUNDED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
  REFUNDED: [],
}

// --- Shipping ---

const EU_COUNTRIES = [
  'DE',
  'FR',
  'IT',
  'ES',
  'NL',
  'BE',
  'AT',
  'PT',
  'IE',
  'FI',
  'GR',
  'LU',
  'SK',
  'SI',
  'EE',
  'LV',
  'LT',
  'CY',
  'MT',
  'HR',
  'BG',
  'RO',
  'CZ',
  'DK',
  'HU',
  'PL',
  'SE',
]

/**
 * Create a product with variants in Stripe and local database
 * Uses rollback pattern to clean up Stripe resources on failure
 */
export async function createProductWithVariants(input: TransformedProductData) {
  const admin = await requireAdmin()
  if (!admin) {
    return { success: false, error: 'Unauthorized' }
  }

  let stripeProductId: string | undefined
  const createdStripePriceIds: string[] = []

  try {
    const slug = slugify(input.name, { lower: true, strict: true })

    // Save images to storage
    const savedImages = await Promise.all(
      input.images.map(async (img, order) => ({
        url: await saveImage(img.url, ImageType.Product, slug),
        name: img.name,
        order,
      })),
    )

    // Create product in Stripe first
    const stripeProduct = await stripe.products.create({
      name: input.name,
      description: input.description,
    })
    stripeProductId = stripeProduct.id

    // Create all Stripe prices before DB operations
    const variantPrices: Array<{
      variant: (typeof input.variants)[number]
      stripePriceIdEUR?: string
      stripePriceIdUSD?: string
    }> = []

    for (const variant of input.variants) {
      let stripePriceIdEUR: string | undefined
      let stripePriceIdUSD: string | undefined

      if (variant.priceEUR !== undefined) {
        const priceEUR = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: variant.priceEUR,
          currency: 'eur',
          metadata: { sku: variant.sku },
        })
        stripePriceIdEUR = priceEUR.id
        createdStripePriceIds.push(priceEUR.id)
      }

      if (variant.priceUSD !== undefined) {
        const priceUSD = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: variant.priceUSD,
          currency: 'usd',
          metadata: { sku: variant.sku },
        })
        stripePriceIdUSD = priceUSD.id
        createdStripePriceIds.push(priceUSD.id)
      }

      variantPrices.push({ variant, stripePriceIdEUR, stripePriceIdUSD })
    }

    // Now create everything in database within a transaction
    const result = await prisma.$transaction(async tx => {
      const product = await tx.product.create({
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

      const createdVariants: ProductVariant[] = []

      for (const { variant, stripePriceIdEUR, stripePriceIdUSD } of variantPrices) {
        const createdVariant = await tx.productVariant.create({
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

      return { product, variants: createdVariants }
    })

    return {
      success: true,
      product: { ...result.product, variants: result.variants },
    }
  } catch (error) {
    console.error('Error creating product with variants:', error)

    // Rollback: archive Stripe prices and product
    if (stripeProductId) {
      try {
        // Archive prices first (can't delete, only archive)
        for (const priceId of createdStripePriceIds) {
          await stripe.prices.update(priceId, { active: false })
        }
        // Archive the product
        await stripe.products.update(stripeProductId, { active: false })
        console.log(`Rolled back Stripe product ${stripeProductId}`)
      } catch (rollbackError) {
        console.error('Failed to rollback Stripe resources:', rollbackError)
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Create Stripe Checkout Session (works with variants)
 * userId is derived from server session — not accepted from client input
 */
export async function createCheckoutSession(input: CreateCheckoutSessionInput) {
  const session = await requireAuth()
  if (!session) {
    return { success: false, error: 'Authentication required' }
  }

  const userId = session.user.id

  try {
    // Get or create customer
    let customer = await prisma.customer.findUnique({
      where: { userId },
      include: { user: true },
    })

    if (!customer) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
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

    // Validate variants and check stock (read-only, can be separate transaction)
    const variants = await prisma.$transaction(async tx => {
      const found = await tx.productVariant.findMany({
        where: {
          id: { in: input.items.map(item => item.variantId) },
        },
        include: { product: true },
      })

      // Check stock availability
      for (const item of input.items) {
        const variant = found.find(v => v.id === item.variantId)
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

      return found
    })

    // Calculate totals
    const subtotal = input.items.reduce((sum, item) => {
      const variant = variants.find(v => v.id === item.variantId)
      if (!variant) return sum
      const price = input.currency === 'EUR' ? variant.priceEUR : variant.priceUSD
      return sum + (price || 0) * item.quantity
    }, 0)

    // Flat-rate shipping: EU = 500 cents, non-EU = 1500 cents
    const isEU = EU_COUNTRIES.includes(input.shippingAddress.country)
    const shippingCost = isEU ? 500 : 1500
    const tax = 0 // Tax handled by Stripe automatic_tax
    const total = subtotal + shippingCost + tax

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`

    // Prepare order items data
    const orderItemsData = input.items.map(item => {
      const variant = variants.find(v => v.id === item.variantId)
      if (!variant) throw new Error(`Variant ${item.variantId} not found`)
      const price = input.currency === 'EUR' ? variant.priceEUR : variant.priceUSD
      return {
        productId: variant.productId,
        variantId: variant.id,
        quantity: item.quantity,
        priceAtTime: price || 0,
        currency: input.currency,
        variantInfo: variant.options as Record<string, string>,
      }
    })

    // Create all DB records atomically in a single transaction
    const order = await prisma.$transaction(async tx => {
      const shippingAddress = await tx.shippingAddress.create({
        data: input.shippingAddress,
      })

      const createdOrder = await tx.order.create({
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
            createMany: { data: orderItemsData },
          },
        },
      })

      return createdOrder
    })

    // Prepare Stripe line items
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

    // Create Stripe Checkout Session (external call, outside DB transaction)
    const stripeSession = await stripe.checkout.sessions.create({
      customer: customer.stripeCustomerId,
      line_items: lineItems,
      mode: 'payment',
      automatic_tax: { enabled: true },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/shop/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/shop/checkout/cancel`,
      metadata: { orderId: order.id },
      payment_intent_data: {
        metadata: { orderId: order.id },
      },
    })

    // Link session to order
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: stripeSession.id },
    })

    return {
      success: true,
      sessionUrl: stripeSession.url,
      orderId: order.id,
    }
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Input for updating a product with variants
 */
interface UpdateProductInput {
  id: string
  name: string
  description?: string
  images: Array<{ url: string; name: string }>
  options: Array<{ name: string; values: string[]; position: number }>
  variants: Array<{
    id?: string // existing variant ID (undefined = new variant)
    sku: string
    options: Record<string, string>
    priceEUR?: number
    priceUSD?: number
    stock: number
    weight?: number
  }>
}

/**
 * Update a product with variants, syncing with Stripe
 * - New variants: create Stripe prices
 * - Deleted variants: archive Stripe prices and soft-delete in DB
 * - Price changes: create new Stripe prices (prices are immutable), archive old ones
 */
export async function updateProductWithVariants(input: UpdateProductInput) {
  const admin = await requireAdmin()
  if (!admin) {
    return { success: false, error: 'Unauthorized' }
  }

  const newStripePriceIds: string[] = []

  try {
    // Fetch existing product with variants
    const existingProduct = await prisma.product.findUnique({
      where: { id: input.id },
      include: {
        variants: true,
        options: true,
        images: true,
      },
    })

    if (!existingProduct) {
      return { success: false, error: 'Product not found' }
    }

    // Determine which variants are new, updated, or deleted
    const existingVariantIds = existingProduct.variants.map(v => v.id)
    const inputVariantIds = input.variants.filter(v => v.id).map(v => v.id as string)
    const deletedVariantIds = existingVariantIds.filter(id => !inputVariantIds.includes(id))

    // Archive Stripe prices for deleted variants
    for (const variantId of deletedVariantIds) {
      const variant = existingProduct.variants.find(v => v.id === variantId)
      if (variant) {
        if (variant.stripePriceIdEUR) {
          await stripe.prices.update(variant.stripePriceIdEUR, { active: false })
        }
        if (variant.stripePriceIdUSD) {
          await stripe.prices.update(variant.stripePriceIdUSD, { active: false })
        }
      }
    }

    // Prepare variant updates with new Stripe prices where needed
    const variantUpdates: Array<{
      variant: (typeof input.variants)[number]
      stripePriceIdEUR?: string
      stripePriceIdUSD?: string
      needsNewEURPrice: boolean
      needsNewUSDPrice: boolean
    }> = []

    for (const inputVariant of input.variants) {
      const existingVariant = inputVariant.id
        ? existingProduct.variants.find(v => v.id === inputVariant.id)
        : undefined

      let stripePriceIdEUR = existingVariant?.stripePriceIdEUR ?? undefined
      let stripePriceIdUSD = existingVariant?.stripePriceIdUSD ?? undefined

      // Check if EUR price changed or is new
      const needsNewEURPrice =
        inputVariant.priceEUR !== undefined &&
        (!existingVariant || existingVariant.priceEUR !== inputVariant.priceEUR)

      // Check if USD price changed or is new
      const needsNewUSDPrice =
        inputVariant.priceUSD !== undefined &&
        (!existingVariant || existingVariant.priceUSD !== inputVariant.priceUSD)

      // Archive old prices and create new ones if price changed
      if (needsNewEURPrice) {
        if (stripePriceIdEUR) {
          await stripe.prices.update(stripePriceIdEUR, { active: false })
        }
        if (inputVariant.priceEUR) {
          const newPrice = await stripe.prices.create({
            product: existingProduct.stripeProductId,
            unit_amount: inputVariant.priceEUR,
            currency: 'eur',
            metadata: { sku: inputVariant.sku },
          })
          stripePriceIdEUR = newPrice.id
          newStripePriceIds.push(newPrice.id)
        } else {
          stripePriceIdEUR = undefined
        }
      }

      if (needsNewUSDPrice) {
        if (stripePriceIdUSD) {
          await stripe.prices.update(stripePriceIdUSD, { active: false })
        }
        if (inputVariant.priceUSD) {
          const newPrice = await stripe.prices.create({
            product: existingProduct.stripeProductId,
            unit_amount: inputVariant.priceUSD,
            currency: 'usd',
            metadata: { sku: inputVariant.sku },
          })
          stripePriceIdUSD = newPrice.id
          newStripePriceIds.push(newPrice.id)
        } else {
          stripePriceIdUSD = undefined
        }
      }

      variantUpdates.push({
        variant: inputVariant,
        stripePriceIdEUR,
        stripePriceIdUSD,
        needsNewEURPrice,
        needsNewUSDPrice,
      })
    }

    // Update Stripe product name/description if changed
    if (existingProduct.name !== input.name || existingProduct.description !== input.description) {
      await stripe.products.update(existingProduct.stripeProductId, {
        name: input.name,
        description: input.description ?? undefined,
      })
    }

    // Handle images - determine new and deleted
    const existingImageUrls = existingProduct.images.map(i => i.url)
    const inputImageUrls = input.images.map(i => i.url)
    const newImages = input.images.filter(i => !existingImageUrls.includes(i.url))
    const deletedImageIds = existingProduct.images
      .filter(i => !inputImageUrls.includes(i.url))
      .map(i => i.id)

    // Fix #11: Calculate order based on remaining images count after deletions
    const remainingImagesCount = existingProduct.images.length - deletedImageIds.length

    // Database transaction
    const result = await prisma.$transaction(async tx => {
      // Delete removed images
      if (deletedImageIds.length > 0) {
        await tx.productImage.deleteMany({
          where: { id: { in: deletedImageIds } },
        })
      }

      // Create new images
      if (newImages.length > 0) {
        await tx.productImage.createMany({
          data: newImages.map((img, index) => ({
            productId: input.id,
            url: img.url,
            name: img.name,
            order: remainingImagesCount + index,
          })),
        })
      }

      // Delete old options and create new ones
      await tx.productOption.deleteMany({
        where: { productId: input.id },
      })

      if (input.options.length > 0) {
        await tx.productOption.createMany({
          data: input.options.map(opt => ({
            productId: input.id,
            name: opt.name,
            values: opt.values,
            position: opt.position,
          })),
        })
      }

      // Soft-delete removed variants
      if (deletedVariantIds.length > 0) {
        await tx.productVariant.updateMany({
          where: { id: { in: deletedVariantIds } },
          data: { isActive: false },
        })
      }

      // Update or create variants
      for (const { variant, stripePriceIdEUR, stripePriceIdUSD } of variantUpdates) {
        if (variant.id) {
          // Update existing variant
          await tx.productVariant.update({
            where: { id: variant.id },
            data: {
              sku: variant.sku,
              options: variant.options,
              priceEUR: variant.priceEUR,
              priceUSD: variant.priceUSD,
              stock: variant.stock,
              weight: variant.weight,
              stripePriceIdEUR,
              stripePriceIdUSD,
            },
          })
        } else {
          // Create new variant
          await tx.productVariant.create({
            data: {
              productId: input.id,
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
        }
      }

      // Fix #10: Update slug when product name changes
      const updatedProduct = await tx.product.update({
        where: { id: input.id },
        data: {
          name: input.name,
          slug: slugify(input.name, { lower: true, strict: true }),
          description: input.description,
        },
        include: {
          images: { orderBy: { order: 'asc' } },
          variants: { where: { isActive: true }, orderBy: { createdAt: 'asc' } },
          options: { orderBy: { position: 'asc' } },
        },
      })

      return updatedProduct
    })

    return { success: true, product: result }
  } catch (error) {
    console.error('Error updating product with variants:', error)

    // Rollback: archive newly created Stripe prices
    for (const priceId of newStripePriceIds) {
      try {
        await stripe.prices.update(priceId, { active: false })
      } catch (rollbackError) {
        console.error('Failed to rollback Stripe price:', rollbackError)
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Update order status with transition validation
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  trackingNumber?: string,
) {
  const admin = await requireAdmin()
  if (!admin) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    // Validate status transition
    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true },
    })

    if (!currentOrder) {
      return { success: false, error: 'Order not found' }
    }

    const allowed = VALID_TRANSITIONS[currentOrder.status]
    if (!allowed.includes(status)) {
      return {
        success: false,
        error: `Cannot transition from ${currentOrder.status} to ${status}`,
      }
    }

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
}

/**
 * Issue a full refund for an order via Stripe
 * Derives stripePaymentIntentId from the order internally
 */
export async function refundOrder(orderId: string) {
  const admin = await requireAdmin()
  if (!admin) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true, stripePaymentIntentId: true },
    })

    if (!order) {
      return { success: false, error: 'Order not found' }
    }

    if (!order.stripePaymentIntentId) {
      return { success: false, error: 'No payment intent for this order' }
    }

    if (!['PAID', 'PROCESSING', 'SHIPPED'].includes(order.status)) {
      return { success: false, error: `Cannot refund order in ${order.status} status` }
    }

    await stripe.refunds.create({
      payment_intent: order.stripePaymentIntentId,
    })

    // The webhook handler (handleChargeRefunded) will update the order status and restore stock
    return { success: true }
  } catch (error) {
    console.error('Error refunding order:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unable to process refund',
    }
  }
}
