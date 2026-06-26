/**
 * @jest-environment node
 */
jest.mock('server-only', () => ({}))
jest.mock('@/prisma/prismaClient', () => ({
  prisma: { order: { findUnique: jest.fn() } },
}))

import { prisma } from '@/prisma/prismaClient'
import { getOrderByNumberAndEmail } from '../queries'
import { lookupGuestOrder } from '../query-actions'

const findUnique = prisma.order.findUnique as jest.Mock

const sampleOrder = {
  id: 'order-1',
  orderNumber: 'ORD-1',
  shippingAddress: { email: 'Buyer@Example.com' },
  items: [],
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('getOrderByNumberAndEmail (email gating)', () => {
  it('returns null when the order does not exist', async () => {
    findUnique.mockResolvedValue(null)
    expect(await getOrderByNumberAndEmail('ORD-X', 'a@b.com')).toBeNull()
  })

  it('returns null when the email does not match (no detail leak)', async () => {
    findUnique.mockResolvedValue(sampleOrder)
    expect(await getOrderByNumberAndEmail('ORD-1', 'someone-else@example.com')).toBeNull()
  })

  it('matches email case-insensitively and ignores surrounding whitespace', async () => {
    findUnique.mockResolvedValue(sampleOrder)
    const result = await getOrderByNumberAndEmail('ORD-1', '  buyer@example.com ')
    expect(result).toBe(sampleOrder)
  })

  it('trims the order number before lookup', async () => {
    findUnique.mockResolvedValue(sampleOrder)
    await getOrderByNumberAndEmail('  ORD-1  ', 'buyer@example.com')
    expect(findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { orderNumber: 'ORD-1' } }),
    )
  })
})

describe('lookupGuestOrder (action)', () => {
  it('rejects invalid email', async () => {
    const res = await lookupGuestOrder({ orderNumber: 'ORD-1', email: 'not-an-email' })
    expect(res.success).toBe(false)
    expect(findUnique).not.toHaveBeenCalled()
  })

  it('rejects empty order number', async () => {
    const res = await lookupGuestOrder({ orderNumber: '   ', email: 'a@b.com' })
    expect(res.success).toBe(false)
  })

  it('returns a generic error when nothing matches', async () => {
    findUnique.mockResolvedValue(null)
    const res = await lookupGuestOrder({ orderNumber: 'ORD-1', email: 'a@b.com' })
    expect(res).toEqual({ success: false, error: 'No order found with that number and email.' })
  })

  it('returns the order on a successful match', async () => {
    findUnique.mockResolvedValue(sampleOrder)
    const res = await lookupGuestOrder({ orderNumber: 'ORD-1', email: 'buyer@example.com' })
    expect(res).toEqual({ success: true, data: sampleOrder })
  })
})
