import type Stripe from 'stripe'

// --- Prisma mock ---
const mockTx = {
  order: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  payment: {
    upsert: jest.fn(),
    update: jest.fn(),
  },
  productVariant: {
    update: jest.fn(),
  },
}

jest.mock('@/prisma/prismaClient', () => ({
  prisma: {
    order: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((fn: (tx: typeof mockTx) => Promise<void>) => fn(mockTx)),
  },
}))

// --- Stripe mock ---
jest.mock('@/services/stripe', () => ({
  stripe: {
    checkout: {
      sessions: {
        list: jest.fn(),
      },
    },
  },
}))

import { prisma } from '@/prisma/prismaClient'
import { stripe } from '@/services/stripe'
import {
  handleChargeRefunded,
  handleCheckoutSessionCompleted,
  handleCheckoutSessionExpired,
  handlePaymentIntentFailed,
} from '../webhooks'

beforeEach(() => {
  jest.clearAllMocks()
})

// --- handleCheckoutSessionCompleted ---

describe('handleCheckoutSessionCompleted', () => {
  const baseSession = {
    id: 'cs_123',
    metadata: { orderId: 'order-1' },
    payment_intent: 'pi_123',
    amount_total: 2999,
    currency: 'eur',
  } as unknown as Stripe.Checkout.Session

  it('marks order as PAID, creates payment, decrements stock', async () => {
    mockTx.order.findUnique
      .mockResolvedValueOnce({ status: 'PENDING' }) // idempotency check
      .mockResolvedValueOnce({
        // stock decrement fetch
        id: 'order-1',
        items: [{ variantId: 'v1', quantity: 2 }],
      })
    mockTx.order.update.mockResolvedValue({})
    mockTx.payment.upsert.mockResolvedValue({})
    mockTx.productVariant.update.mockResolvedValue({})

    await handleCheckoutSessionCompleted(baseSession)

    expect(mockTx.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'PAID', stripePaymentIntentId: 'pi_123' }),
      }),
    )
    expect(mockTx.payment.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { stripePaymentIntentId: 'pi_123' },
        create: expect.objectContaining({ status: 'SUCCEEDED' }),
      }),
    )
    expect(mockTx.productVariant.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'v1' },
        data: { stock: { decrement: 2 } },
      }),
    )
  })

  it('skips if order already PAID (idempotency)', async () => {
    mockTx.order.findUnique.mockResolvedValueOnce({ status: 'PAID' })

    await handleCheckoutSessionCompleted(baseSession)

    expect(mockTx.order.update).not.toHaveBeenCalled()
    expect(mockTx.payment.upsert).not.toHaveBeenCalled()
  })

  it('returns early when no orderId in metadata', async () => {
    const session = { ...baseSession, metadata: {} } as unknown as Stripe.Checkout.Session

    await handleCheckoutSessionCompleted(session)

    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it('returns early when no payment_intent in session', async () => {
    const session = {
      ...baseSession,
      payment_intent: null,
    } as unknown as Stripe.Checkout.Session
    mockTx.order.findUnique.mockResolvedValueOnce({ status: 'PENDING' })

    await handleCheckoutSessionCompleted(session)

    expect(mockTx.order.update).not.toHaveBeenCalled()
  })
})

// --- handleCheckoutSessionExpired ---

describe('handleCheckoutSessionExpired', () => {
  it('marks order as CANCELLED', async () => {
    ;(prisma.order.update as jest.Mock).mockResolvedValue({})

    await handleCheckoutSessionExpired({
      metadata: { orderId: 'order-1' },
    } as unknown as Stripe.Checkout.Session)

    expect(prisma.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'order-1' },
        data: expect.objectContaining({ status: 'CANCELLED' }),
      }),
    )
  })

  it('returns early when no orderId in metadata', async () => {
    await handleCheckoutSessionExpired({
      metadata: {},
    } as unknown as Stripe.Checkout.Session)

    expect(prisma.order.update).not.toHaveBeenCalled()
  })
})

// --- handlePaymentIntentFailed ---

describe('handlePaymentIntentFailed', () => {
  const basePI = {
    id: 'pi_fail',
    amount: 2000,
    currency: 'eur',
    last_payment_error: { message: 'Card declined' },
    metadata: { orderId: 'order-1' },
  } as unknown as Stripe.PaymentIntent

  it('finds order via metadata and cancels it', async () => {
    ;(prisma.order.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'order-1' })
    mockTx.order.update.mockResolvedValue({})
    mockTx.payment.upsert.mockResolvedValue({})

    await handlePaymentIntentFailed(basePI)

    // First lookup should be by metadata orderId
    expect(prisma.order.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'order-1' } }),
    )
    expect(mockTx.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'CANCELLED' }),
      }),
    )
    expect(mockTx.payment.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ status: 'FAILED' }),
      }),
    )
  })

  it('falls back to stripePaymentIntentId lookup', async () => {
    const piNoMeta = { ...basePI, metadata: {} } as unknown as Stripe.PaymentIntent
    ;(prisma.order.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'order-2' })
    mockTx.order.update.mockResolvedValue({})
    mockTx.payment.upsert.mockResolvedValue({})

    await handlePaymentIntentFailed(piNoMeta)

    expect(prisma.order.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { stripePaymentIntentId: 'pi_fail' } }),
    )
  })

  it('falls back to Stripe session list lookup', async () => {
    const piNoMeta = { ...basePI, metadata: {} } as unknown as Stripe.PaymentIntent
    ;(prisma.order.findUnique as jest.Mock)
      .mockResolvedValueOnce(null) // by paymentIntentId
      .mockResolvedValueOnce({ id: 'order-3' }) // by session metadata
    ;(stripe.checkout.sessions.list as jest.Mock).mockResolvedValueOnce({
      data: [{ metadata: { orderId: 'order-3' } }],
    })
    mockTx.order.update.mockResolvedValue({})
    mockTx.payment.upsert.mockResolvedValue({})

    await handlePaymentIntentFailed(piNoMeta)

    expect(stripe.checkout.sessions.list).toHaveBeenCalledWith(
      expect.objectContaining({ payment_intent: 'pi_fail' }),
    )
    expect(mockTx.order.update).toHaveBeenCalled()
  })

  it('logs error and returns when order not found at all', async () => {
    const piNoMeta = { ...basePI, metadata: {} } as unknown as Stripe.PaymentIntent
    ;(prisma.order.findUnique as jest.Mock).mockResolvedValue(null)
    ;(stripe.checkout.sessions.list as jest.Mock).mockResolvedValueOnce({ data: [] })

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    await handlePaymentIntentFailed(piNoMeta)

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Order not found for payment intent'),
    )
    expect(prisma.$transaction).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})

// --- handleChargeRefunded ---

describe('handleChargeRefunded', () => {
  const baseCharge = {
    id: 'ch_123',
    payment_intent: 'pi_ref',
    amount: 2000,
    amount_refunded: 2000,
  } as unknown as Stripe.Charge

  it('processes full refund: status REFUNDED, stock restored', async () => {
    mockTx.order.findUnique.mockResolvedValueOnce({
      id: 'order-1',
      status: 'PAID',
      items: [
        { variantId: 'v1', quantity: 2 },
        { variantId: 'v2', quantity: 1 },
      ],
    })
    mockTx.order.update.mockResolvedValue({})
    mockTx.payment.update.mockResolvedValue({})
    mockTx.productVariant.update.mockResolvedValue({})

    await handleChargeRefunded(baseCharge)

    expect(mockTx.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: 'REFUNDED' },
      }),
    )
    expect(mockTx.payment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'REFUNDED', refundAmount: 2000 }),
      }),
    )
    // Stock restored for both variants
    expect(mockTx.productVariant.update).toHaveBeenCalledTimes(2)
    expect(mockTx.productVariant.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'v1' },
        data: { stock: { increment: 2 } },
      }),
    )
  })

  it('handles partial refund: order stays same status, stock NOT restored', async () => {
    const partialCharge = {
      ...baseCharge,
      amount_refunded: 1000, // half refund
    } as unknown as Stripe.Charge

    mockTx.order.findUnique.mockResolvedValueOnce({
      id: 'order-1',
      status: 'PAID',
      items: [{ variantId: 'v1', quantity: 2 }],
    })
    mockTx.payment.update.mockResolvedValue({})

    await handleChargeRefunded(partialCharge)

    // Order status NOT updated (no order.update call for status)
    expect(mockTx.order.update).not.toHaveBeenCalled()
    // Payment updated with partial amount
    expect(mockTx.payment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'SUCCEEDED', refundAmount: 1000 }),
      }),
    )
    // Stock NOT restored
    expect(mockTx.productVariant.update).not.toHaveBeenCalled()
  })

  it('skips if order already REFUNDED (idempotency)', async () => {
    mockTx.order.findUnique.mockResolvedValueOnce({
      id: 'order-1',
      status: 'REFUNDED',
      items: [],
    })

    await handleChargeRefunded(baseCharge)

    expect(mockTx.order.update).not.toHaveBeenCalled()
    expect(mockTx.payment.update).not.toHaveBeenCalled()
  })

  it('returns early when no payment_intent in charge', async () => {
    const charge = {
      ...baseCharge,
      payment_intent: null,
    } as unknown as Stripe.Charge

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    await handleChargeRefunded(charge)

    expect(prisma.$transaction).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('logs error when order not found for payment intent', async () => {
    mockTx.order.findUnique.mockResolvedValueOnce(null)

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    await handleChargeRefunded(baseCharge)

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Order not found for payment intent'),
    )
    expect(mockTx.order.update).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})
