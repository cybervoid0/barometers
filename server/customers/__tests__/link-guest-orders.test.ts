/**
 * @jest-environment node
 */
jest.mock('@/prisma/prismaClient', () => require('../../testing/mocks').prismaMockModule)

import { linkGuestOrdersToUser } from '@/server/customers/link-guest-orders'
import { mockPrisma, resetAllMocks } from '../../testing/mocks'

beforeEach(resetAllMocks)

describe('linkGuestOrdersToUser', () => {
  it('is a no-op when userId or email is missing', async () => {
    expect(await linkGuestOrdersToUser('', 'a@b.com')).toEqual({ linked: false, orderCount: 0 })
    expect(await linkGuestOrdersToUser('u-1', '')).toEqual({ linked: false, orderCount: 0 })
    expect(mockPrisma.customer.findMany).not.toHaveBeenCalled()
  })

  it('is a no-op when there are no guest customers for the email', async () => {
    mockPrisma.customer.findMany.mockResolvedValue([])
    const result = await linkGuestOrdersToUser('u-1', 'a@b.com')
    expect(result).toEqual({ linked: false, orderCount: 0 })
    expect(mockPrisma.$transaction).not.toHaveBeenCalled()
  })

  it('promotes the single guest customer when the user has none', async () => {
    mockPrisma.customer.findMany.mockResolvedValue([{ id: 'guest-1' }])
    mockPrisma.customer.findUnique.mockResolvedValue(null) // user has no customer
    mockPrisma.order.count.mockResolvedValue(2)

    const result = await linkGuestOrdersToUser('u-1', 'a@b.com')

    expect(mockPrisma.customer.update).toHaveBeenCalledWith({
      where: { id: 'guest-1' },
      data: { userId: 'u-1' },
    })
    // Single guest → no order re-homing, no deletes
    expect(mockPrisma.order.updateMany).not.toHaveBeenCalled()
    expect(mockPrisma.customer.deleteMany).not.toHaveBeenCalled()
    expect(result).toEqual({ linked: true, orderCount: 2 })
  })

  it('merges guest orders into the existing account customer', async () => {
    mockPrisma.customer.findMany.mockResolvedValue([{ id: 'guest-1' }])
    mockPrisma.customer.findUnique.mockResolvedValue({ id: 'existing-1' }) // user already has one
    mockPrisma.order.updateMany.mockResolvedValue({ count: 1 })
    mockPrisma.order.count.mockResolvedValue(3)

    const result = await linkGuestOrdersToUser('u-1', 'a@b.com')

    // Existing customer is the target — guest is NOT promoted
    expect(mockPrisma.customer.update).not.toHaveBeenCalled()
    expect(mockPrisma.order.updateMany).toHaveBeenCalledWith({
      where: { customerId: { in: ['guest-1'] } },
      data: { customerId: 'existing-1' },
    })
    expect(mockPrisma.customer.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ['guest-1'] } },
    })
    expect(result).toEqual({ linked: true, orderCount: 3 })
  })

  it('merges multiple guest customers into one promoted target', async () => {
    mockPrisma.customer.findMany.mockResolvedValue([
      { id: 'guest-1' },
      { id: 'guest-2' },
      { id: 'guest-3' },
    ])
    mockPrisma.customer.findUnique.mockResolvedValue(null)
    mockPrisma.order.updateMany.mockResolvedValue({ count: 4 })
    mockPrisma.order.count.mockResolvedValue(5)

    const result = await linkGuestOrdersToUser('u-1', 'a@b.com')

    // First guest promoted to the account
    expect(mockPrisma.customer.update).toHaveBeenCalledWith({
      where: { id: 'guest-1' },
      data: { userId: 'u-1' },
    })
    // The remaining guests' orders re-homed onto the promoted one, then deleted
    expect(mockPrisma.order.updateMany).toHaveBeenCalledWith({
      where: { customerId: { in: ['guest-2', 'guest-3'] } },
      data: { customerId: 'guest-1' },
    })
    expect(mockPrisma.customer.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ['guest-2', 'guest-3'] } },
    })
    expect(result).toEqual({ linked: true, orderCount: 5 })
  })

  it('only ever assigns userId to a single customer (unique constraint safety)', async () => {
    mockPrisma.customer.findMany.mockResolvedValue([{ id: 'guest-1' }, { id: 'guest-2' }])
    mockPrisma.customer.findUnique.mockResolvedValue(null)
    mockPrisma.order.updateMany.mockResolvedValue({ count: 0 })
    mockPrisma.order.count.mockResolvedValue(1)

    await linkGuestOrdersToUser('u-1', 'a@b.com')

    expect(mockPrisma.customer.update).toHaveBeenCalledTimes(1)
  })
})
