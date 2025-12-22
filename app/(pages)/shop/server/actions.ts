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
 * Uses rollback pattern to clean up Stripe resources on failure
 */
export const createProductWithVariants = withPrisma(
  async (prisma, input: TransformedProductData) => {
    let stripeProductId: string | undefined
    const createdStripePriceIds: string[] = []

    try {
      // Save images to storage
      const savedImages = await saveProductImages(input.images)

      // Create product in Stripe first
      const stripeProduct = await stripe.products.create({
        name: input.name,
        description: input.description,
      })
      stripeProductId = stripeProduct.id

      const slug = slugify(input.name, { lower: true, strict: true })

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
export const updateProductWithVariants = withPrisma(async (prisma, input: UpdateProductInput) => {
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
            order: existingProduct.images.length + index,
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

      // Update product basic info
      const updatedProduct = await tx.product.update({
        where: { id: input.id },
        data: {
          name: input.name,
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
})

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
