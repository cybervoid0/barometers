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
// `$transaction` runs the callback against the same mock object, so a tx call
// like `tx.productVariant.updateMany` resolves to the same jest.fn the test set
// up. Defined inside the factory to avoid the jest-hoist TDZ; tests reach the
// mocks through the `mockPrisma` alias below.
jest.mock('@/prisma/prismaClient', () => {
  const prisma = {
    order: {
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn(),
    },
    customer: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    productVariant: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    orderItem: {
      count: jest.fn(),
    },
    productImage: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    productOption: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    shippingAddress: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  }
  // Set after construction to avoid a self-reference in the initializer.
  prisma.$transaction.mockImplementation((fn: (tx: unknown) => Promise<unknown>) => fn(prisma))
  return { prisma }
})

// --- Mock Stripe ---
jest.mock('@/services/stripe', () => ({
  stripe: {
    refunds: { create: jest.fn() },
    customers: { create: jest.fn(), del: jest.fn() },
    checkout: { sessions: { create: jest.fn(), expire: jest.fn(), retrieve: jest.fn() } },
    prices: { create: jest.fn(), update: jest.fn() },
    products: { create: jest.fn(), update: jest.fn() },
  },
}))

// --- Mock next/cache (storefront revalidation after product mutations) ---
const mockRevalidatePath = jest.fn()
jest.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}))

// --- Mock slugify ---
jest.mock('slugify', () => jest.fn((s: string) => s.toLowerCase().replace(/\s+/g, '-')))

// --- Mock file utils ---
jest.mock('@/server/files/images', () => ({
  saveImage: jest.fn(),
}))

// --- Mock email senders (avoids loading resend/react-email under Jest) ---
const mockSendOrderShippedEmail = jest.fn()
const mockSendTrackingUpdatedEmail = jest.fn()
jest.mock('@/server/email/order-shipped', () => ({
  sendOrderShippedEmail: (...args: unknown[]) => mockSendOrderShippedEmail(...args),
  sendTrackingUpdatedEmail: (...args: unknown[]) => mockSendTrackingUpdatedEmail(...args),
}))

import { prisma } from '@/prisma/prismaClient'
import { stripe } from '@/services/stripe'
import {
  createCheckoutSession,
  deleteProduct,
  refundOrder,
  setProductActive,
  updateOrderStatus,
  updateProductWithVariants,
  updateTrackingNumber,
} from '../actions'

// Typed view of the Prisma mock for the createCheckoutSession tests (same object
// the action imports — `prisma` and `mockPrisma` are identical at runtime).
const mockPrisma = prisma as unknown as {
  order: Record<string, jest.Mock>
  customer: Record<string, jest.Mock>
  productVariant: Record<string, jest.Mock>
  product: Record<string, jest.Mock>
  orderItem: Record<string, jest.Mock>
  productImage: Record<string, jest.Mock>
  productOption: Record<string, jest.Mock>
  shippingAddress: Record<string, jest.Mock>
  $transaction: jest.Mock
}

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

  // CANCELLED is handled separately (it routes through releasePendingOrder, not a
  // plain status update) — see the dedicated cancel tests below.
  const validTransitions: Array<[OrderStatus, OrderStatus]> = [
    ['PENDING', 'PAID'],
    ['PAID', 'PROCESSING'],
    ['PAID', 'REFUNDED'],
    ['PROCESSING', 'SHIPPED'],
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
    ['PAID', 'CANCELLED'],
    ['PROCESSING', 'PENDING'],
    ['PROCESSING', 'PAID'],
    ['PROCESSING', 'DELIVERED'],
    ['PROCESSING', 'CANCELLED'],
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

  it('cancels a PENDING order via releasePendingOrder and expires the open Stripe session', async () => {
    mockGetServerSession.mockResolvedValueOnce(adminSession)
    ;(prisma.order.findUnique as jest.Mock)
      // updateOrderStatus reads the current order...
      .mockResolvedValueOnce({ status: 'PENDING', stripeSessionId: 'sess_1' })
      // ...then releasePendingOrder reads it back (with items) inside its tx.
      .mockResolvedValueOnce({ id: 'order-1', items: [] })
    ;(stripe.checkout.sessions.retrieve as jest.Mock).mockResolvedValueOnce({
      status: 'open',
      payment_status: 'unpaid',
    })
    ;(prisma.order.updateMany as jest.Mock).mockResolvedValueOnce({ count: 1 })

    const result = await updateOrderStatus('order-1', 'CANCELLED')

    expect(result.success).toBe(true)
    expect(stripe.checkout.sessions.expire).toHaveBeenCalledWith('sess_1')
    // Guarded cancel (updateMany where status PENDING), never a plain status flip.
    expect(prisma.order.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'order-1', status: 'PENDING' },
        data: expect.objectContaining({ status: 'CANCELLED' }),
      }),
    )
    expect(prisma.order.update).not.toHaveBeenCalled()
  })

  it('refuses to cancel when the Stripe session is already paid (no fund strand)', async () => {
    mockGetServerSession.mockResolvedValueOnce(adminSession)
    ;(prisma.order.findUnique as jest.Mock).mockResolvedValueOnce({
      status: 'PENDING',
      stripeSessionId: 'sess_1',
    })
    // Buyer paid in the race window before the completed-webhook landed.
    ;(stripe.checkout.sessions.retrieve as jest.Mock).mockResolvedValueOnce({
      status: 'complete',
      payment_status: 'paid',
    })

    const result = await updateOrderStatus('order-1', 'CANCELLED')

    expect(result.success).toBe(false)
    // Must NOT expire or release — the order would otherwise be cancelled with funds captured.
    expect(stripe.checkout.sessions.expire).not.toHaveBeenCalled()
    expect(prisma.order.updateMany).not.toHaveBeenCalled()
  })

  it('aborts the cancel when the Stripe session cannot be verified', async () => {
    mockGetServerSession.mockResolvedValueOnce(adminSession)
    ;(prisma.order.findUnique as jest.Mock).mockResolvedValueOnce({
      status: 'PENDING',
      stripeSessionId: 'sess_1',
    })
    ;(stripe.checkout.sessions.retrieve as jest.Mock).mockRejectedValueOnce(new Error('boom'))

    const result = await updateOrderStatus('order-1', 'CANCELLED')

    expect(result.success).toBe(false)
    expect(prisma.order.updateMany).not.toHaveBeenCalled()
  })

  it('fails to cancel when the order is no longer PENDING (guard no-op)', async () => {
    mockGetServerSession.mockResolvedValueOnce(adminSession)
    ;(prisma.order.findUnique as jest.Mock).mockResolvedValueOnce({
      status: 'PENDING',
      stripeSessionId: null,
    })
    // releasePendingOrder's guarded updateMany matches nothing → no-op release.
    ;(prisma.order.updateMany as jest.Mock).mockResolvedValueOnce({ count: 0 })

    const result = await updateOrderStatus('order-1', 'CANCELLED')

    expect(result.success).toBe(false)
    expect(stripe.checkout.sessions.expire).not.toHaveBeenCalled()
    expect(prisma.order.update).not.toHaveBeenCalled()
  })

  it('sends the shipped notification when transitioning to SHIPPED', async () => {
    mockGetServerSession.mockResolvedValueOnce(adminSession)
    ;(prisma.order.findUnique as jest.Mock).mockResolvedValueOnce({ status: 'PROCESSING' })
    ;(prisma.order.update as jest.Mock).mockResolvedValueOnce({ id: 'order-1', status: 'SHIPPED' })

    await updateOrderStatus('order-1', 'SHIPPED', 'TRACK-123')

    expect(mockSendOrderShippedEmail).toHaveBeenCalledWith('order-1')
  })

  it('does not send the shipped notification for non-SHIPPED transitions', async () => {
    mockGetServerSession.mockResolvedValueOnce(adminSession)
    ;(prisma.order.findUnique as jest.Mock).mockResolvedValueOnce({ status: 'PAID' })
    ;(prisma.order.update as jest.Mock).mockResolvedValueOnce({
      id: 'order-1',
      status: 'PROCESSING',
    })

    await updateOrderStatus('order-1', 'PROCESSING')

    expect(mockSendOrderShippedEmail).not.toHaveBeenCalled()
  })
})

// --- updateTrackingNumber ---

describe('updateTrackingNumber', () => {
  const adminSession = { user: { id: 'u1', role: 'ADMIN' } }

  it('returns Unauthorized when no session', async () => {
    mockGetServerSession.mockResolvedValueOnce(null)

    const result = await updateTrackingNumber('order-1', 'TRACK-1')

    expect(result).toEqual({ success: false, error: 'Unauthorized' })
    expect(prisma.order.findUnique).not.toHaveBeenCalled()
  })

  it('returns error when order not found', async () => {
    mockGetServerSession.mockResolvedValueOnce(adminSession)
    ;(prisma.order.findUnique as jest.Mock).mockResolvedValueOnce(null)

    const result = await updateTrackingNumber('order-1', 'TRACK-1')

    expect(result).toEqual({ success: false, error: 'Order not found' })
  })

  for (const status of ['PENDING', 'PAID', 'PROCESSING', 'CANCELLED'] as OrderStatus[]) {
    it(`rejects editing tracking for ${status} order`, async () => {
      mockGetServerSession.mockResolvedValueOnce(adminSession)
      ;(prisma.order.findUnique as jest.Mock).mockResolvedValueOnce({
        status,
        trackingNumber: null,
      })

      const result = await updateTrackingNumber('order-1', 'TRACK-1')

      expect(result.success).toBe(false)
      expect(result.error).toContain('after the order has shipped')
      expect(prisma.order.update).not.toHaveBeenCalled()
    })
  }

  it('saves a new tracking number and emails the customer', async () => {
    mockGetServerSession.mockResolvedValueOnce(adminSession)
    ;(prisma.order.findUnique as jest.Mock).mockResolvedValueOnce({
      status: 'SHIPPED',
      trackingNumber: null,
    })
    ;(prisma.order.update as jest.Mock).mockResolvedValueOnce({ id: 'order-1' })

    const result = await updateTrackingNumber('order-1', '  TRACK-NEW  ')

    expect(result).toEqual({ success: true })
    expect(prisma.order.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { trackingNumber: 'TRACK-NEW' } }),
    )
    expect(mockSendTrackingUpdatedEmail).toHaveBeenCalledWith('order-1')
  })

  it('allows editing tracking on a DELIVERED order', async () => {
    mockGetServerSession.mockResolvedValueOnce(adminSession)
    ;(prisma.order.findUnique as jest.Mock).mockResolvedValueOnce({
      status: 'DELIVERED',
      trackingNumber: 'OLD',
    })
    ;(prisma.order.update as jest.Mock).mockResolvedValueOnce({ id: 'order-1' })

    const result = await updateTrackingNumber('order-1', 'NEW')

    expect(result).toEqual({ success: true })
    expect(mockSendTrackingUpdatedEmail).toHaveBeenCalledWith('order-1')
  })

  it('clears the tracking number without emailing when set empty', async () => {
    mockGetServerSession.mockResolvedValueOnce(adminSession)
    ;(prisma.order.findUnique as jest.Mock).mockResolvedValueOnce({
      status: 'SHIPPED',
      trackingNumber: 'OLD',
    })
    ;(prisma.order.update as jest.Mock).mockResolvedValueOnce({ id: 'order-1' })

    const result = await updateTrackingNumber('order-1', '   ')

    expect(result).toEqual({ success: true })
    expect(prisma.order.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { trackingNumber: null } }),
    )
    expect(mockSendTrackingUpdatedEmail).not.toHaveBeenCalled()
  })

  it('is a no-op (no update, no email) when the value is unchanged', async () => {
    mockGetServerSession.mockResolvedValueOnce(adminSession)
    ;(prisma.order.findUnique as jest.Mock).mockResolvedValueOnce({
      status: 'SHIPPED',
      trackingNumber: 'SAME',
    })

    const result = await updateTrackingNumber('order-1', 'SAME')

    expect(result).toEqual({ success: true, unchanged: true })
    expect(prisma.order.update).not.toHaveBeenCalled()
    expect(mockSendTrackingUpdatedEmail).not.toHaveBeenCalled()
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
      expect(stripe.refunds.create).toHaveBeenCalledWith(
        { payment_intent: 'pi_123' },
        { idempotencyKey: 'refund/order-1' },
      )
    })
  }
})

// --- createCheckoutSession ---

describe('createCheckoutSession', () => {
  const validInput = {
    items: [{ variantId: 'v1', quantity: 2 }],
    shippingAddress: {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      address: '1 High St',
      city: 'Amsterdam',
      postalCode: '1011',
      country: 'NL',
    },
  }

  const activeVariant = {
    id: 'v1',
    isActive: true,
    product: { isActive: true, name: 'Barometer Mug' },
    productId: 'p1',
    priceEUR: 1500,
    weight: 500,
    stripePriceIdEUR: 'price_1',
    options: { Size: 'L' },
    sku: 'SKU-1',
  }

  it('rejects a non-positive quantity before any DB work (input validation)', async () => {
    mockGetServerSession.mockResolvedValueOnce(null)

    const result = await createCheckoutSession({
      ...validInput,
      items: [{ variantId: 'v1', quantity: 0 }],
    })

    expect(result.success).toBe(false)
    expect(mockPrisma.customer.findUnique).not.toHaveBeenCalled()
    expect(mockPrisma.productVariant.findMany).not.toHaveBeenCalled()
  })

  it('reserves stock with a guarded decrement and returns the Stripe URL', async () => {
    mockGetServerSession.mockResolvedValueOnce({ user: { id: 'u1' } })
    mockPrisma.customer.findUnique.mockResolvedValueOnce({ id: 'c1', stripeCustomerId: 'cus_1' })
    mockPrisma.productVariant.findMany.mockResolvedValueOnce([activeVariant])
    mockPrisma.productVariant.updateMany.mockResolvedValue({ count: 1 })
    mockPrisma.shippingAddress.create.mockResolvedValueOnce({ id: 'sa1' })
    mockPrisma.order.create.mockResolvedValueOnce({ id: 'order-1' })
    mockPrisma.order.update.mockResolvedValueOnce({})
    ;(stripe.checkout.sessions.create as jest.Mock).mockResolvedValueOnce({
      id: 'cs_1',
      url: 'https://stripe.test/checkout',
    })

    const result = await createCheckoutSession(validInput)

    expect(result).toEqual({
      success: true,
      sessionUrl: 'https://stripe.test/checkout',
      orderId: 'order-1',
    })
    // Guarded conditional decrement — only succeeds if enough stock remains.
    expect(mockPrisma.productVariant.updateMany).toHaveBeenCalledWith({
      where: { id: 'v1', stock: { gte: 2 } },
      data: { stock: { decrement: 2 } },
    })
  })

  it('aborts and does not call Stripe when stock cannot be reserved', async () => {
    mockGetServerSession.mockResolvedValueOnce({ user: { id: 'u1' } })
    mockPrisma.customer.findUnique.mockResolvedValueOnce({ id: 'c1', stripeCustomerId: 'cus_1' })
    mockPrisma.productVariant.findMany.mockResolvedValueOnce([activeVariant])
    // Reservation loses the row → count 0 → throws inside the transaction.
    mockPrisma.productVariant.updateMany.mockResolvedValue({ count: 0 })

    const result = await createCheckoutSession(validInput)

    expect(result.success).toBe(false)
    expect(stripe.checkout.sessions.create).not.toHaveBeenCalled()
  })

  it('rolls back the reservation and cancels the order if Stripe fails', async () => {
    mockGetServerSession.mockResolvedValueOnce({ user: { id: 'u1' } })
    mockPrisma.customer.findUnique.mockResolvedValueOnce({ id: 'c1', stripeCustomerId: 'cus_1' })
    mockPrisma.productVariant.findMany.mockResolvedValueOnce([activeVariant])
    mockPrisma.productVariant.updateMany.mockResolvedValue({ count: 1 }) // reservation
    mockPrisma.shippingAddress.create.mockResolvedValueOnce({ id: 'sa1' })
    mockPrisma.order.create.mockResolvedValueOnce({ id: 'order-1' })
    // releasePendingOrder rollback path:
    mockPrisma.order.updateMany.mockResolvedValue({ count: 1 })
    mockPrisma.order.findUnique.mockResolvedValue({
      id: 'order-1',
      items: [{ variantId: 'v1', quantity: 2 }],
    })
    mockPrisma.productVariant.update.mockResolvedValue({})
    ;(stripe.checkout.sessions.create as jest.Mock).mockRejectedValueOnce(new Error('stripe down'))

    const result = await createCheckoutSession(validInput)

    expect(result).toEqual({ success: false, error: 'Failed to create checkout session' })
    // Order cancelled (guarded) via releasePendingOrder.
    expect(mockPrisma.order.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'order-1', status: 'PENDING' },
        data: expect.objectContaining({ status: 'CANCELLED' }),
      }),
    )
    // Stock returned through the shared helper (productVariant.update, not updateMany).
    expect(mockPrisma.productVariant.update).toHaveBeenCalledWith({
      where: { id: 'v1' },
      data: { stock: { increment: 2 } },
    })
  })
})

// --- updateProductWithVariants (stock delta) ---

describe('updateProductWithVariants — stock delta', () => {
  const adminSession = { user: { id: 'u1', role: 'ADMIN' } }

  const existingProduct = {
    id: 'p1',
    name: 'Barometer Mug',
    description: 'A mug',
    stripeProductId: 'prod_1',
    images: [],
    options: [],
    variants: [
      {
        id: 'v1',
        sku: 'SKU-1',
        options: { Size: 'L' },
        priceEUR: 1500,
        stock: 5,
        weight: 500,
        stripePriceIdEUR: 'price_1',
      },
    ],
  }

  // Edit form: same name/price/options (no Stripe price or product mutation),
  // admin bumps stock 5 → 10 with originalStock baseline 5.
  const editInput = {
    id: 'p1',
    name: 'Barometer Mug',
    description: 'A mug',
    images: [],
    options: [],
    variants: [
      {
        id: 'v1',
        sku: 'SKU-1',
        options: { Size: 'L' },
        priceEUR: 1500,
        stock: 10,
        originalStock: 5,
        weight: 500,
      },
    ],
  }

  it('updates stock as an atomic delta (new − original), not an absolute set', async () => {
    mockGetServerSession.mockResolvedValueOnce(adminSession)
    mockPrisma.product.findUnique.mockResolvedValueOnce(existingProduct)
    mockPrisma.productOption.deleteMany.mockResolvedValue({})
    mockPrisma.productVariant.update.mockResolvedValue({})
    mockPrisma.product.update.mockResolvedValueOnce({ id: 'p1', name: 'Barometer Mug' })

    const result = await updateProductWithVariants(editInput)

    expect(result.success).toBe(true)
    // The whole point: a concurrent sale's decrement isn't clobbered.
    expect(mockPrisma.productVariant.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'v1' },
        data: expect.objectContaining({ stock: { increment: 5 } }),
      }),
    )
    // No Stripe price/product mutation when nothing pricing-related changed.
    expect(stripe.prices.create).not.toHaveBeenCalled()
    expect(stripe.products.update).not.toHaveBeenCalled()
  })
})

// --- setProductActive (hide / show) ---

describe('setProductActive', () => {
  const adminSession = { user: { id: 'u1', role: 'ADMIN' } }

  it('returns Unauthorized for non-admin', async () => {
    mockGetServerSession.mockResolvedValueOnce({ user: { id: 'u1', role: 'USER' } })

    const result = await setProductActive('p1', false)

    expect(result).toEqual({ success: false, error: 'Unauthorized' })
    expect(mockPrisma.product.findUnique).not.toHaveBeenCalled()
    expect(stripe.products.update).not.toHaveBeenCalled()
  })

  it('hides a product: archives it on Stripe (active:false) and flips isActive in DB', async () => {
    mockGetServerSession.mockResolvedValueOnce(adminSession)
    mockPrisma.product.findUnique.mockResolvedValueOnce({
      stripeProductId: 'prod_1',
      slug: 'barometer-mug',
      deletedAt: null,
    })
    ;(stripe.products.update as jest.Mock).mockResolvedValueOnce({})
    mockPrisma.product.update.mockResolvedValueOnce({})

    const result = await setProductActive('p1', false)

    expect(result).toEqual({ success: true, isActive: false })
    expect(stripe.products.update).toHaveBeenCalledWith('prod_1', { active: false })
    expect(mockPrisma.product.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: { isActive: false },
    })
    expect(mockRevalidatePath).toHaveBeenCalledWith('/shop')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/shop/barometer-mug')
  })

  it('shows a product again (active:true)', async () => {
    mockGetServerSession.mockResolvedValueOnce(adminSession)
    mockPrisma.product.findUnique.mockResolvedValueOnce({
      stripeProductId: 'prod_1',
      slug: 'barometer-mug',
      deletedAt: null,
    })
    ;(stripe.products.update as jest.Mock).mockResolvedValueOnce({})
    mockPrisma.product.update.mockResolvedValueOnce({})

    const result = await setProductActive('p1', true)

    expect(result).toEqual({ success: true, isActive: true })
    expect(stripe.products.update).toHaveBeenCalledWith('prod_1', { active: true })
  })

  it('refuses to show a soft-deleted product', async () => {
    mockGetServerSession.mockResolvedValueOnce(adminSession)
    mockPrisma.product.findUnique.mockResolvedValueOnce({
      stripeProductId: 'prod_1',
      slug: 'barometer-mug',
      deletedAt: new Date('2026-01-01'),
    })

    const result = await setProductActive('p1', true)

    expect(result.success).toBe(false)
    expect(stripe.products.update).not.toHaveBeenCalled()
    expect(mockPrisma.product.update).not.toHaveBeenCalled()
  })

  it('reverts the Stripe change when the DB write fails (no divergence)', async () => {
    mockGetServerSession.mockResolvedValueOnce(adminSession)
    mockPrisma.product.findUnique.mockResolvedValueOnce({
      stripeProductId: 'prod_1',
      slug: 'barometer-mug',
      deletedAt: null,
    })
    ;(stripe.products.update as jest.Mock)
      .mockResolvedValueOnce({}) // the hide
      .mockResolvedValueOnce({}) // the rollback
    mockPrisma.product.update.mockRejectedValueOnce(new Error('db down'))

    const result = await setProductActive('p1', false)

    expect(result.success).toBe(false)
    // First archives (false), then reverts back to the prior state (true).
    expect(stripe.products.update).toHaveBeenNthCalledWith(1, 'prod_1', { active: false })
    expect(stripe.products.update).toHaveBeenNthCalledWith(2, 'prod_1', { active: true })
  })
})

// --- deleteProduct ---

describe('deleteProduct', () => {
  const adminSession = { user: { id: 'u1', role: 'ADMIN' } }

  const productWithPrice = {
    slug: 'barometer-mug',
    isActive: true,
    stripeProductId: 'prod_1',
    variants: [{ stripePriceIdEUR: 'price_1' }, { stripePriceIdEUR: null }],
  }

  it('returns Unauthorized for non-admin', async () => {
    mockGetServerSession.mockResolvedValueOnce({ user: { id: 'u1', role: 'USER' } })

    const result = await deleteProduct('p1')

    expect(result).toEqual({ success: false, error: 'Unauthorized' })
    expect(mockPrisma.product.findUnique).not.toHaveBeenCalled()
  })

  it('hard-deletes when no order references it (and archives Stripe prices + product)', async () => {
    mockGetServerSession.mockResolvedValueOnce(adminSession)
    mockPrisma.product.findUnique.mockResolvedValueOnce(productWithPrice)
    mockPrisma.orderItem.count.mockResolvedValueOnce(0)
    ;(stripe.prices.update as jest.Mock).mockResolvedValueOnce({})
    ;(stripe.products.update as jest.Mock).mockResolvedValueOnce({})
    mockPrisma.product.delete.mockResolvedValueOnce({})

    const result = await deleteProduct('p1')

    expect(result).toEqual({ success: true, softDeleted: false })
    // Prices archived first, then the product.
    expect(stripe.prices.update).toHaveBeenCalledWith('price_1', { active: false })
    expect(stripe.products.update).toHaveBeenCalledWith('prod_1', { active: false })
    expect(mockPrisma.product.delete).toHaveBeenCalledWith({ where: { id: 'p1' } })
    expect(mockPrisma.product.update).not.toHaveBeenCalled()
  })

  it('soft-deletes (sets deletedAt) when an order references it', async () => {
    mockGetServerSession.mockResolvedValueOnce(adminSession)
    mockPrisma.product.findUnique.mockResolvedValueOnce(productWithPrice)
    mockPrisma.orderItem.count.mockResolvedValueOnce(3)
    ;(stripe.prices.update as jest.Mock).mockResolvedValueOnce({})
    ;(stripe.products.update as jest.Mock).mockResolvedValueOnce({})
    mockPrisma.product.update.mockResolvedValueOnce({})

    const result = await deleteProduct('p1')

    expect(result).toEqual({ success: true, softDeleted: true })
    expect(mockPrisma.product.delete).not.toHaveBeenCalled()
    expect(mockPrisma.product.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: { isActive: false, deletedAt: expect.any(Date) },
    })
    // Stripe still archived to keep it off Stripe's active catalogue.
    expect(stripe.products.update).toHaveBeenCalledWith('prod_1', { active: false })
  })

  it('reverses Stripe archival when the DB write fails (no divergence)', async () => {
    mockGetServerSession.mockResolvedValueOnce(adminSession)
    mockPrisma.product.findUnique.mockResolvedValueOnce(productWithPrice)
    mockPrisma.orderItem.count.mockResolvedValueOnce(0)
    ;(stripe.prices.update as jest.Mock).mockResolvedValue({})
    ;(stripe.products.update as jest.Mock).mockResolvedValue({})
    mockPrisma.product.delete.mockRejectedValueOnce(new Error('db down'))

    const result = await deleteProduct('p1')

    expect(result.success).toBe(false)
    // Price reactivated and product restored to its prior active state.
    expect(stripe.prices.update).toHaveBeenCalledWith('price_1', { active: true })
    expect(stripe.products.update).toHaveBeenCalledWith('prod_1', { active: true })
  })

  it('returns an error when the product does not exist', async () => {
    mockGetServerSession.mockResolvedValueOnce(adminSession)
    mockPrisma.product.findUnique.mockResolvedValueOnce(null)

    const result = await deleteProduct('p1')

    expect(result).toEqual({ success: false, error: 'Product not found' })
    expect(stripe.products.update).not.toHaveBeenCalled()
  })
})
