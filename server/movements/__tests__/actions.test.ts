/**
 * @jest-environment node
 */
jest.mock('@/prisma/prismaClient', () => require('../../testing/mocks').prismaMockModule)
jest.mock('@/server/auth', () => require('../../testing/mocks').authMockModule)
jest.mock('next/cache', () => require('../../testing/mocks').cacheMockModule)

import { Prisma } from '@prisma/client'
import { createMovement, deleteMovement } from '@/server/movements/actions'
import { mockPrisma, mockRequireAdmin, mockUpdateTag, resetAllMocks } from '../../testing/mocks'

beforeEach(resetAllMocks)

const validCreateData = { name: 'Mechanical', description: 'Spring-driven movement' }

describe('createMovement', () => {
  it('rejects when not admin', async () => {
    mockRequireAdmin.mockRejectedValue(new Error('Unauthorized: admin access required'))
    await expect(createMovement(validCreateData)).rejects.toThrow('Unauthorized')
    expect(mockPrisma.subCategory.create).not.toHaveBeenCalled()
  })

  it('rejects invalid data (empty name)', async () => {
    await expect(createMovement({ name: '' })).rejects.toThrow()
  })

  it('creates movement and returns id + name', async () => {
    mockPrisma.subCategory.create.mockResolvedValue({ id: 1, name: 'Mechanical' })
    const result = await createMovement(validCreateData)
    expect(result).toEqual({ success: true, data: { id: 1, name: 'Mechanical' } })
    expect(mockPrisma.subCategory.create).toHaveBeenCalledWith({
      data: { name: 'Mechanical', description: 'Spring-driven movement' },
    })
  })

  it('creates movement without optional description', async () => {
    mockPrisma.subCategory.create.mockResolvedValue({ id: 2, name: 'Digital' })
    const result = await createMovement({ name: 'Digital' })
    expect(result).toEqual({ success: true, data: { id: 2, name: 'Digital' } })
  })

  it('calls updateTag for movements AND barometers', async () => {
    mockPrisma.subCategory.create.mockResolvedValue({ id: 1, name: 'Mechanical' })
    await createMovement(validCreateData)
    expect(mockUpdateTag).toHaveBeenCalledWith('movements')
    expect(mockUpdateTag).toHaveBeenCalledWith('barometers')
  })

  it('handles P2002 unique constraint (duplicate name)', async () => {
    const p2002 = new Prisma.PrismaClientKnownRequestError('Unique', {
      code: 'P2002',
      clientVersion: '5.0.0',
    })
    mockPrisma.subCategory.create.mockRejectedValue(p2002)
    const result = await createMovement(validCreateData)
    expect(result).toEqual({
      success: false,
      error: expect.stringContaining('Mechanical'),
    })
  })

  it('returns generic error on unknown failure', async () => {
    jest.spyOn(console, 'error').mockImplementation()
    mockPrisma.subCategory.create.mockRejectedValue(new Error('DB error'))
    const result = await createMovement(validCreateData)
    expect(result).toEqual({
      success: false,
      error: 'Failed to create movement type. Please try again.',
    })
  })
})

describe('deleteMovement', () => {
  it('rejects when not admin', async () => {
    mockRequireAdmin.mockRejectedValue(new Error('Unauthorized: admin access required'))
    await expect(deleteMovement({ id: 1 })).rejects.toThrow('Unauthorized')
    expect(mockPrisma.subCategory.delete).not.toHaveBeenCalled()
  })

  it('rejects invalid id', async () => {
    await expect(deleteMovement({ id: 'abc' })).rejects.toThrow()
  })

  it('deletes movement and returns id', async () => {
    mockPrisma.subCategory.delete.mockResolvedValue({ id: 1 })
    const result = await deleteMovement({ id: 1 })
    expect(result).toEqual({ success: true, data: { id: 1 } })
    expect(mockPrisma.subCategory.delete).toHaveBeenCalledWith({ where: { id: 1 } })
  })

  it('calls updateTag for movements AND barometers', async () => {
    mockPrisma.subCategory.delete.mockResolvedValue({ id: 1 })
    await deleteMovement({ id: 1 })
    expect(mockUpdateTag).toHaveBeenCalledWith('movements')
    expect(mockUpdateTag).toHaveBeenCalledWith('barometers')
  })

  it('handles P2003 foreign key constraint (movement in use)', async () => {
    const p2003 = new Prisma.PrismaClientKnownRequestError('FK', {
      code: 'P2003',
      clientVersion: '5.0.0',
    })
    mockPrisma.subCategory.delete.mockRejectedValue(p2003)
    const result = await deleteMovement({ id: 1 })
    expect(result).toEqual({
      success: false,
      error: 'Cannot delete movement type that is used by barometers',
    })
  })

  it('returns generic error on unknown failure', async () => {
    jest.spyOn(console, 'error').mockImplementation()
    mockPrisma.subCategory.delete.mockRejectedValue(new Error('DB error'))
    const result = await deleteMovement({ id: 1 })
    expect(result).toEqual({
      success: false,
      error: 'Failed to delete movement type. Please try again.',
    })
  })
})
