import 'server-only'

import type { OrderStatus } from '@prisma/client'
import { prisma } from '@/prisma/prismaClient'

/**
 * Get all products with variants and options
 */
export async function getProducts() {
  return prisma.product.findMany({
    where: { isActive: true, deletedAt: null },
    include: {
      images: {
        orderBy: { order: 'asc' },
      },
      variants: {
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
      },
      options: {
        orderBy: { position: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Get product list by IDs array with variants
 */
export async function getProductsByIds(productIds: string[]) {
  return prisma.product.findMany({
    where: {
      id: { in: productIds },
      isActive: true,
      deletedAt: null,
    },
    include: {
      images: {
        orderBy: { order: 'asc' },
      },
      variants: {
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
      },
      options: {
        orderBy: { position: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Get variants by IDs array (for cart)
 */
export async function getVariantsByIds(variantIds: string[]) {
  return prisma.productVariant.findMany({
    where: {
      id: { in: variantIds },
      isActive: true,
      product: { isActive: true, deletedAt: null },
    },
    include: {
      product: {
        include: {
          images: {
            orderBy: { order: 'asc' },
            take: 1,
          },
        },
      },
      images: {
        orderBy: { order: 'asc' },
        take: 1,
      },
    },
  })
}

/**
 * Get product by ID with variants and options (admin edit form).
 *
 * Deliberately does NOT filter `isActive` — an admin must be able to open and
 * edit a *hidden* product. It does exclude soft-`deletedAt` products so a deleted
 * product's edit page 404s.
 */
export async function getProductById(id: string) {
  return prisma.product.findFirst({
    where: { id, deletedAt: null },
    include: {
      images: {
        orderBy: { order: 'asc' },
      },
      variants: {
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
        include: {
          images: {
            orderBy: { order: 'asc' },
          },
        },
      },
      options: {
        orderBy: { position: 'asc' },
      },
    },
  })
}

/**
 * Get product by slug with variants and options (public storefront page).
 *
 * Excludes both hidden (`isActive:false`) and soft-deleted (`deletedAt`) products
 * so their `/shop/[slug]` page 404s. `findFirst` (not `findUnique`) because we add
 * non-unique filters; `slug` is still unique so at most one row matches.
 */
export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, isActive: true, deletedAt: null },
    include: {
      images: {
        orderBy: { order: 'asc' },
      },
      variants: {
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
        include: {
          images: {
            orderBy: { order: 'asc' },
          },
        },
      },
      options: {
        orderBy: { position: 'asc' },
      },
    },
  })
}

/**
 * Get every product for the admin products list — including hidden
 * (`isActive:false`) ones, so a hidden product can still be found and un-hidden.
 * Only soft-`deletedAt` products are excluded (they're gone for good). Active
 * variants only, so a soft-deleted variant doesn't inflate the stock/price shown.
 */
export async function getAdminProducts() {
  return prisma.product.findMany({
    where: { deletedAt: null },
    include: {
      images: {
        orderBy: { order: 'asc' },
        take: 1,
      },
      variants: {
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Get orders by user ID
 */
export async function getOrdersByUserId(userId: string) {
  const customer = await prisma.customer.findUnique({
    where: { userId },
  })

  if (!customer) {
    return []
  }

  return prisma.order.findMany({
    where: { customerId: customer.id },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: {
                take: 1,
                orderBy: { order: 'asc' },
              },
            },
          },
          variant: true,
        },
      },
      shippingAddress: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Get order by ID
 */
export async function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: true,
            },
          },
          variant: true,
        },
      },
      shippingAddress: true,
      customer: {
        include: {
          user: true,
        },
      },
      payment: true,
    },
  })
}

/**
 * Get all orders (admin)
 */
export async function getAllOrders(status?: OrderStatus) {
  return prisma.order.findMany({
    where: status ? { status } : undefined,
    include: {
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
      shippingAddress: true,
      customer: {
        include: {
          user: true,
        },
      },
      payment: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Look up an order for guest tracking — by order number, gated on a matching
 * shipping email. Returns null unless both match, so order numbers alone never
 * leak order details. Email comparison is case-insensitive and trimmed.
 */
export async function getOrderByNumberAndEmail(orderNumber: string, email: string) {
  // Cheap existence + email check first. Doing the full include only AFTER the
  // email matches keeps the "wrong order number" and "right number, wrong email"
  // paths the same cost, so timing can't be used as an oracle to confirm which
  // order numbers exist.
  const match = await prisma.order.findUnique({
    where: { orderNumber: orderNumber.trim() },
    select: { id: true, shippingAddress: { select: { email: true } } },
  })

  if (!match) return null
  if (match.shippingAddress.email.toLowerCase() !== email.trim().toLowerCase()) return null

  // Email verified — load the full order for the legitimate owner.
  return prisma.order.findUnique({
    where: { id: match.id },
    include: {
      items: {
        include: {
          product: { include: { images: { take: 1, orderBy: { order: 'asc' } } } },
          variant: true,
        },
      },
      shippingAddress: true,
      payment: true,
    },
  })
}

/**
 * Get order by session ID
 */
export async function getOrderBySessionId(sessionId: string) {
  return prisma.order.findUnique({
    where: { stripeSessionId: sessionId },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
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
}
