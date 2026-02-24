import 'server-only'

import type { OrderStatus } from '@prisma/client'
import { prisma } from '@/prisma/prismaClient'

/**
 * Get all products with variants and options
 */
export async function getProducts() {
  return prisma.product.findMany({
    where: { isActive: true },
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
      product: { isActive: true },
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
 * Get product by ID with variants and options
 */
export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
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
 * Get product by slug with variants and options
 */
export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
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
