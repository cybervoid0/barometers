import 'server-only'

import type { OrderStatus } from '@prisma/client'
import { withPrisma } from '@/prisma/prismaClient'

/**
 * Get all products
 */
export const getProducts = withPrisma(async prisma => {
  return prisma.product.findMany({
    where: { isActive: true },
    include: {
      images: {
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
})

/**
 * Get product list by IDs array
 */
export const getProductsByIds = withPrisma(async (prisma, productIds: string[]) => {
  return prisma.product.findMany({
    where: {
      id: {
        in: productIds,
      },
      isActive: true,
    },
    include: {
      images: {
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
})

/**
 * Get product by ID
 */
export const getProductById = withPrisma(async (prisma, id: string) => {
  return prisma.product.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: { order: 'asc' },
      },
    },
  })
})

/**
 * Get product by slug
 */
export const getProductBySlug = withPrisma(async (prisma, slug: string) => {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      images: {
        orderBy: { order: 'asc' },
      },
    },
  })
})

/**
 * Get orders by user ID
 */
export const getOrdersByUserId = withPrisma(async (prisma, userId: string) => {
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
        },
      },
      shippingAddress: true,
    },
    orderBy: { createdAt: 'desc' },
  })
})

/**
 * Get order by ID
 */
export const getOrderById = withPrisma(async (prisma, id: string) => {
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
})

/**
 * Get all orders (admin)
 */
export const getAllOrders = withPrisma(async (prisma, status?: OrderStatus) => {
  return prisma.order.findMany({
    where: status ? { status } : undefined,
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
      payment: true,
    },
    orderBy: { createdAt: 'desc' },
  })
})

/**
 * Get order by session ID
 */
export const getOrderBySessionId = withPrisma(async (prisma, sessionId: string) =>
  prisma.order.findUnique({
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
  }),
)
