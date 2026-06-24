/**
 * @jest-environment node
 */
jest.mock('@/prisma/prismaClient', () => require('../../testing/mocks').prismaMockModule)
jest.mock('bcrypt', () => ({ hash: jest.fn().mockResolvedValue('hashed-pw') }))

import { register } from '@/server/register/actions'
import { mockPrisma, resetAllMocks } from '../../testing/mocks'

beforeEach(resetAllMocks)

describe('register', () => {
  it('rejects invalid input (missing email)', async () => {
    await expect(register({ name: 'Test', password: 'pass' })).rejects.toThrow()
  })

  it('rejects invalid email format', async () => {
    await expect(register({ name: 'Test', email: 'not-email', password: 'pass' })).rejects.toThrow()
  })

  it('throws when email already exists', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'u-1' })
    await expect(
      register({ name: 'Test', email: 'test@test.com', password: 'pass' }),
    ).rejects.toThrow('Email already exists!')
  })

  it('creates user with hashed password and role USER', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)
    mockPrisma.user.create.mockResolvedValue({})
    await register({ name: 'Test', email: 'test@test.com', password: 'pass' })
    expect(mockPrisma.user.create).toHaveBeenCalledWith({
      data: { name: 'Test', email: 'test@test.com', password: 'hashed-pw', role: 'USER' },
    })
  })

  it('does NOT set role to ADMIN regardless of input', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)
    mockPrisma.user.create.mockResolvedValue({})
    await register({ name: 'Hack', email: 'hack@test.com', password: 'pass', role: 'ADMIN' })
    expect(mockPrisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ role: 'USER' }) }),
    )
  })

  it('links prior guest orders for the new user (by email)', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)
    mockPrisma.user.create.mockResolvedValue({ id: 'u-new' })
    mockPrisma.customer.findMany.mockResolvedValue([{ id: 'guest-1' }])
    mockPrisma.customer.findUnique.mockResolvedValue(null)
    mockPrisma.order.count.mockResolvedValue(1)

    await register({ name: 'Test', email: 'guest@test.com', password: 'pass' })

    expect(mockPrisma.customer.findMany).toHaveBeenCalledWith({
      where: { email: 'guest@test.com', userId: null },
      select: { id: true },
    })
    expect(mockPrisma.customer.update).toHaveBeenCalledWith({
      where: { id: 'guest-1' },
      data: { userId: 'u-new' },
    })
  })

  it('still succeeds when guest-order linking throws (non-fatal)', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)
    mockPrisma.user.create.mockResolvedValue({ id: 'u-new' })
    mockPrisma.customer.findMany.mockRejectedValue(new Error('db down'))

    await expect(
      register({ name: 'Test', email: 'guest@test.com', password: 'pass' }),
    ).resolves.toBeUndefined()
  })
})
