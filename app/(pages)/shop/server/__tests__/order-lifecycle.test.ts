/**
 * @jest-environment node
 */
jest.mock('@/prisma/prismaClient', () => {
  const prisma = {
    order: {
      updateMany: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    productVariant: {
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  }
  // Run the transaction callback against the same mock object.
  prisma.$transaction.mockImplementation((fn: (tx: unknown) => Promise<unknown>) => fn(prisma))
  return { prisma }
})

import { CHECKOUT_SESSION_TTL_SECONDS } from '@/constants'
import { prisma } from '@/prisma/prismaClient'
import { releasePendingOrder, releaseStalePendingOrders } from '../order-lifecycle'

const mockPrisma = prisma as unknown as {
  order: Record<string, jest.Mock>
  productVariant: Record<string, jest.Mock>
  $transaction: jest.Mock
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('releasePendingOrder', () => {
  it('cancels a PENDING order and restores its reserved stock', async () => {
    mockPrisma.order.updateMany.mockResolvedValue({ count: 1 })
    mockPrisma.order.findUnique.mockResolvedValue({
      id: 'order-1',
      items: [
        { variantId: 'v1', quantity: 2 },
        { variantId: 'v2', quantity: 1 },
      ],
    })
    mockPrisma.productVariant.update.mockResolvedValue({})

    await releasePendingOrder('order-1', 'test')

    expect(mockPrisma.order.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'order-1', status: 'PENDING' },
        data: expect.objectContaining({ status: 'CANCELLED' }),
      }),
    )
    expect(mockPrisma.productVariant.update).toHaveBeenCalledTimes(2)
    expect(mockPrisma.productVariant.update).toHaveBeenCalledWith({
      where: { id: 'v1' },
      data: { stock: { increment: 2 } },
    })
  })

  it('does nothing to stock when the order is no longer PENDING', async () => {
    mockPrisma.order.updateMany.mockResolvedValue({ count: 0 })

    await releasePendingOrder('order-1', 'test')

    expect(mockPrisma.order.findUnique).not.toHaveBeenCalled()
    expect(mockPrisma.productVariant.update).not.toHaveBeenCalled()
  })

  it('skips items with no variantId', async () => {
    mockPrisma.order.updateMany.mockResolvedValue({ count: 1 })
    mockPrisma.order.findUnique.mockResolvedValue({
      id: 'order-1',
      items: [{ variantId: null, quantity: 3 }],
    })

    await releasePendingOrder('order-1', 'test')

    expect(mockPrisma.productVariant.update).not.toHaveBeenCalled()
  })
})

describe('releaseStalePendingOrders', () => {
  const NOW = 10_000_000_000
  const expectedCutoff = new Date(NOW - CHECKOUT_SESSION_TTL_SECONDS * 1000 - 60 * 60 * 1000)

  beforeEach(() => {
    // Default: each release succeeds as a no-op-stock cancellation.
    mockPrisma.order.updateMany.mockResolvedValue({ count: 1 })
    mockPrisma.order.findUnique.mockResolvedValue({ id: 'x', items: [] })
  })

  it('queries only PENDING orders older than the TTL + buffer cutoff', async () => {
    mockPrisma.order.findMany.mockResolvedValue([])

    const result = await releaseStalePendingOrders(NOW)

    expect(mockPrisma.order.findMany).toHaveBeenCalledWith({
      where: { status: 'PENDING', createdAt: { lt: expectedCutoff } },
      select: { id: true },
    })
    expect(result).toEqual({ released: 0 })
  })

  it('releases every stale order and returns the count', async () => {
    mockPrisma.order.findMany.mockResolvedValue([{ id: 'o1' }, { id: 'o2' }])

    const result = await releaseStalePendingOrders(NOW)

    expect(result).toEqual({ released: 2 })
    expect(mockPrisma.order.updateMany).toHaveBeenCalledTimes(2)
  })

  it('continues the sweep when one order fails to release', async () => {
    mockPrisma.order.findMany.mockResolvedValue([{ id: 'o1' }, { id: 'o2' }])
    // First release throws (transaction rejects), second succeeds.
    mockPrisma.$transaction
      .mockImplementationOnce(() => Promise.reject(new Error('boom')))
      .mockImplementationOnce((fn: (tx: unknown) => Promise<unknown>) => fn(prisma))

    const result = await releaseStalePendingOrders(NOW)

    expect(result).toEqual({ released: 1 })
  })
})
