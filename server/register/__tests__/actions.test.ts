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
})
