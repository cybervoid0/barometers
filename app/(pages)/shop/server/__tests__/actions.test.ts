import type { OrderStatus } from '@prisma/client'

// --- Mock next-auth ---
const mockGetServerSession = jest.fn()
jest.mock('next-auth', () => ({
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}))

// --- Mock auth config ---
jest.mock('@/services/auth', () => ({
  authConfig: { secret: 'test' },
}))

// --- Mock Prisma ---
jest.mock('@/prisma/prismaClient', () => ({
  prisma: {
    order: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}))

// --- Mock Stripe ---
jest.mock('@/services/stripe', () => ({
  stripe: {
    refunds: { create: jest.fn() },
  },
}))

// --- Mock slugify ---
jest.mock('slugify', () => jest.fn((s: string) => s.toLowerCase().replace(/\s+/g, '-')))

// --- Mock file utils ---
jest.mock('@/server/files/images', () => ({
  saveImage: jest.fn(),
}))

import { prisma } from '@/prisma/prismaClient'
import { stripe } from '@/services/stripe'
import { refundOrder, updateOrderStatus } from '../actions'

beforeEach(() => {
  jest.clearAllMocks()
})

// --- Auth guard tests ---

describe('updateOrderStatus — auth', () => {
  it('returns Unauthorized when no session', async () => {
    mockGetServerSession.mockResolvedValueOnce(null)

    const result = await updateOrderStatus('order-1', 'PROCESSING')

    expect(result).toEqual({ success: false, error: 'Unauthorized' })
    expect(prisma.order.findUnique).not.toHaveBeenCalled()
  })

  it('returns Unauthorized for non-admin user', async () => {
    mockGetServerSession.mockResolvedValueOnce({
      user: { id: 'u1', role: 'USER' },
    })

    const result = await updateOrderStatus('order-1', 'PROCESSING')

    expect(result).toEqual({ success: false, error: 'Unauthorized' })
    expect(prisma.order.findUnique).not.toHaveBeenCalled()
  })

  it('allows ADMIN role', async () => {
    mockGetServerSession.mockResolvedValueOnce({
      user: { id: 'u1', role: 'ADMIN' },
    })
    ;(prisma.order.findUnique as jest.Mock).mockResolvedValueOnce({ status: 'PAID' })
    ;(prisma.order.update as jest.Mock).mockResolvedValueOnce({
      id: 'order-1',
      status: 'PROCESSING',
    })

    const result = await updateOrderStatus('order-1', 'PROCESSING')

    expect(result.success).toBe(true)
  })

  it('allows OWNER role', async () => {
    mockGetServerSession.mockResolvedValueOnce({
      user: { id: 'u1', role: 'OWNER' },
    })
    ;(prisma.order.findUnique as jest.Mock).mockResolvedValueOnce({ status: 'PAID' })
    ;(prisma.order.update as jest.Mock).mockResolvedValueOnce({
      id: 'order-1',
      status: 'PROCESSING',
    })

    const result = await updateOrderStatus('order-1', 'PROCESSING')

    expect(result.success).toBe(true)
  })
})

describe('refundOrder — auth', () => {
  it('returns Unauthorized when no session', async () => {
    mockGetServerSession.mockResolvedValueOnce(null)

    const result = await refundOrder('order-1')

    expect(result).toEqual({ success: false, error: 'Unauthorized' })
  })

  it('returns Unauthorized for non-admin user', async () => {
    mockGetServerSession.mockResolvedValueOnce({
      user: { id: 'u1', role: 'USER' },
    })

    const result = await refundOrder('order-1')

    expect(result).toEqual({ success: false, error: 'Unauthorized' })
  })
})

// --- Status transitions ---

describe('updateOrderStatus — transitions', () => {
  const adminSession = { user: { id: 'u1', role: 'ADMIN' } }

  const validTransitions: Array<[OrderStatus, OrderStatus]> = [
    ['PENDING', 'PAID'],
    ['PENDING', 'CANCELLED'],
    ['PAID', 'PROCESSING'],
    ['PAID', 'CANCELLED'],
    ['PAID', 'REFUNDED'],
    ['PROCESSING', 'SHIPPED'],
    ['PROCESSING', 'CANCELLED'],
    ['PROCESSING', 'REFUNDED'],
    ['SHIPPED', 'DELIVERED'],
  ]

  const invalidTransitions: Array<[OrderStatus, OrderStatus]> = [
    ['PENDING', 'PROCESSING'],
    ['PENDING', 'SHIPPED'],
    ['PENDING', 'DELIVERED'],
    ['PENDING', 'REFUNDED'],
    ['PAID', 'PENDING'],
    ['PAID', 'SHIPPED'],
    ['PAID', 'DELIVERED'],
    ['PROCESSING', 'PENDING'],
    ['PROCESSING', 'PAID'],
    ['PROCESSING', 'DELIVERED'],
    ['SHIPPED', 'PENDING'],
    ['SHIPPED', 'PAID'],
    ['SHIPPED', 'PROCESSING'],
    ['SHIPPED', 'CANCELLED'],
    ['SHIPPED', 'REFUNDED'],
    ['DELIVERED', 'PENDING'],
    ['DELIVERED', 'PAID'],
    ['DELIVERED', 'PROCESSING'],
    ['DELIVERED', 'SHIPPED'],
    ['DELIVERED', 'CANCELLED'],
    ['DELIVERED', 'REFUNDED'],
    ['CANCELLED', 'PENDING'],
    ['CANCELLED', 'PAID'],
    ['REFUNDED', 'PENDING'],
    ['REFUNDED', 'PAID'],
  ]

  for (const [from, to] of validTransitions) {
    it(`allows ${from} → ${to}`, async () => {
      mockGetServerSession.mockResolvedValueOnce(adminSession)
      ;(prisma.order.findUnique as jest.Mock).mockResolvedValueOnce({ status: from })
      ;(prisma.order.update as jest.Mock).mockResolvedValueOnce({ id: 'order-1', status: to })

      const result = await updateOrderStatus('order-1', to)

      expect(result.success).toBe(true)
      expect(prisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: to }),
        }),
      )
    })
  }

  for (const [from, to] of invalidTransitions) {
    it(`rejects ${from} → ${to}`, async () => {
      mockGetServerSession.mockResolvedValueOnce(adminSession)
      ;(prisma.order.findUnique as jest.Mock).mockResolvedValueOnce({ status: from })

      const result = await updateOrderStatus('order-1', to)

      expect(result.success).toBe(false)
      expect(result.error).toContain(`Cannot transition from ${from} to ${to}`)
      expect(prisma.order.update).not.toHaveBeenCalled()
    })
  }

  it('returns error when order not found', async () => {
    mockGetServerSession.mockResolvedValueOnce(adminSession)
    ;(prisma.order.findUnique as jest.Mock).mockResolvedValueOnce(null)

    const result = await updateOrderStatus('order-1', 'PROCESSING')

    expect(result).toEqual({ success: false, error: 'Order not found' })
  })

  it('sets shippedAt when transitioning to SHIPPED', async () => {
    mockGetServerSession.mockResolvedValueOnce(adminSession)
    ;(prisma.order.findUnique as jest.Mock).mockResolvedValueOnce({ status: 'PROCESSING' })
    ;(prisma.order.update as jest.Mock).mockResolvedValueOnce({ id: 'order-1', status: 'SHIPPED' })

    await updateOrderStatus('order-1', 'SHIPPED', 'TRACK-123')

    expect(prisma.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'SHIPPED',
          trackingNumber: 'TRACK-123',
          shippedAt: expect.any(Date),
        }),
      }),
    )
  })

  it('sets deliveredAt when transitioning to DELIVERED', async () => {
    mockGetServerSession.mockResolvedValueOnce(adminSession)
    ;(prisma.order.findUnique as jest.Mock).mockResolvedValueOnce({ status: 'SHIPPED' })
    ;(prisma.order.update as jest.Mock).mockResolvedValueOnce({
      id: 'order-1',
      status: 'DELIVERED',
    })

    await updateOrderStatus('order-1', 'DELIVERED')

    expect(prisma.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'DELIVERED',
          deliveredAt: expect.any(Date),
        }),
      }),
    )
  })

  it('sets cancelledAt when transitioning to CANCELLED', async () => {
    mockGetServerSession.mockResolvedValueOnce(adminSession)
    ;(prisma.order.findUnique as jest.Mock).mockResolvedValueOnce({ status: 'PAID' })
    ;(prisma.order.update as jest.Mock).mockResolvedValueOnce({
      id: 'order-1',
      status: 'CANCELLED',
    })

    await updateOrderStatus('order-1', 'CANCELLED')

    expect(prisma.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'CANCELLED',
          cancelledAt: expect.any(Date),
        }),
      }),
    )
  })
})

// --- refundOrder validation ---

describe('refundOrder — validation', () => {
  const adminSession = { user: { id: 'u1', role: 'ADMIN' } }

  it('returns error when order not found', async () => {
    mockGetServerSession.mockResolvedValueOnce(adminSession)
    ;(prisma.order.findUnique as jest.Mock).mockResolvedValueOnce(null)

    const result = await refundOrder('order-1')

    expect(result).toEqual({ success: false, error: 'Order not found' })
  })

  it('returns error when no stripePaymentIntentId', async () => {
    mockGetServerSession.mockResolvedValueOnce(adminSession)
    ;(prisma.order.findUnique as jest.Mock).mockResolvedValueOnce({
      status: 'PAID',
      stripePaymentIntentId: null,
    })

    const result = await refundOrder('order-1')

    expect(result).toEqual({ success: false, error: 'No payment intent for this order' })
  })

  it('rejects refund for PENDING order', async () => {
    mockGetServerSession.mockResolvedValueOnce(adminSession)
    ;(prisma.order.findUnique as jest.Mock).mockResolvedValueOnce({
      status: 'PENDING',
      stripePaymentIntentId: 'pi_123',
    })

    const result = await refundOrder('order-1')

    expect(result.success).toBe(false)
    expect(result.error).toContain('Cannot refund order in PENDING status')
  })

  it('rejects refund for DELIVERED order', async () => {
    mockGetServerSession.mockResolvedValueOnce(adminSession)
    ;(prisma.order.findUnique as jest.Mock).mockResolvedValueOnce({
      status: 'DELIVERED',
      stripePaymentIntentId: 'pi_123',
    })

    const result = await refundOrder('order-1')

    expect(result.success).toBe(false)
    expect(result.error).toContain('Cannot refund order in DELIVERED status')
  })

  it('rejects refund for CANCELLED order', async () => {
    mockGetServerSession.mockResolvedValueOnce(adminSession)
    ;(prisma.order.findUnique as jest.Mock).mockResolvedValueOnce({
      status: 'CANCELLED',
      stripePaymentIntentId: 'pi_123',
    })

    const result = await refundOrder('order-1')

    expect(result.success).toBe(false)
    expect(result.error).toContain('Cannot refund order in CANCELLED status')
  })

  it('rejects refund for already REFUNDED order', async () => {
    mockGetServerSession.mockResolvedValueOnce(adminSession)
    ;(prisma.order.findUnique as jest.Mock).mockResolvedValueOnce({
      status: 'REFUNDED',
      stripePaymentIntentId: 'pi_123',
    })

    const result = await refundOrder('order-1')

    expect(result.success).toBe(false)
    expect(result.error).toContain('Cannot refund order in REFUNDED status')
  })

  for (const status of ['PAID', 'PROCESSING', 'SHIPPED'] as OrderStatus[]) {
    it(`allows refund for ${status} order`, async () => {
      mockGetServerSession.mockResolvedValueOnce(adminSession)
      ;(prisma.order.findUnique as jest.Mock).mockResolvedValueOnce({
        status,
        stripePaymentIntentId: 'pi_123',
      })
      ;(stripe.refunds.create as jest.Mock).mockResolvedValueOnce({ id: 're_123' })

      const result = await refundOrder('order-1')

      expect(result.success).toBe(true)
      expect(stripe.refunds.create).toHaveBeenCalledWith({
        payment_intent: 'pi_123',
      })
    })
  }
})
