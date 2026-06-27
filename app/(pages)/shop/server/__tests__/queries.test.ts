// Verifies the storefront/admin query filters: hidden (`isActive:false`) and
// soft-deleted (`deletedAt`) products must be excluded from the public queries,
// and the admin list must include hidden but exclude deleted.

jest.mock('@/prisma/prismaClient', () => ({
  prisma: {
    product: {
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn().mockResolvedValue(null),
    },
    productVariant: {
      findMany: jest.fn().mockResolvedValue([]),
    },
  },
}))

import { prisma } from '@/prisma/prismaClient'
import {
  getAdminProducts,
  getProductById,
  getProductBySlug,
  getProducts,
  getProductsByIds,
  getVariantsByIds,
} from '../queries'

const mockPrisma = prisma as unknown as {
  product: { findMany: jest.Mock; findFirst: jest.Mock }
  productVariant: { findMany: jest.Mock }
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('storefront query filters', () => {
  it('getProducts excludes hidden and deleted', async () => {
    await getProducts()
    expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isActive: true, deletedAt: null } }),
    )
  })

  it('getProductsByIds excludes hidden and deleted', async () => {
    await getProductsByIds(['p1'])
    expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: { in: ['p1'] }, isActive: true, deletedAt: null },
      }),
    )
  })

  it('getVariantsByIds excludes variants of hidden/deleted products', async () => {
    await getVariantsByIds(['v1'])
    expect(mockPrisma.productVariant.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          product: { isActive: true, deletedAt: null },
        }),
      }),
    )
  })

  it('getProductBySlug 404s hidden/deleted (filters isActive + deletedAt)', async () => {
    await getProductBySlug('barometer-mug')
    expect(mockPrisma.product.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: 'barometer-mug', isActive: true, deletedAt: null },
      }),
    )
  })

  it('getProductById allows hidden (no isActive filter) but excludes deleted', async () => {
    await getProductById('p1')
    expect(mockPrisma.product.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'p1', deletedAt: null } }),
    )
  })

  it('getAdminProducts includes hidden but excludes deleted', async () => {
    await getAdminProducts()
    expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { deletedAt: null } }),
    )
  })
})
