/**
 * @jest-environment node
 */
jest.mock('@/prisma/prismaClient', () => require('../../testing/mocks').prismaMockModule)
jest.mock('@/server/auth', () => require('../../testing/mocks').authMockModule)
jest.mock('next/cache', () => require('../../testing/mocks').cacheMockModule)

import { Prisma } from '@prisma/client'
import { createMaterial, deleteMaterial, updateMaterial } from '@/server/materials/actions'
import { mockPrisma, mockRequireAdmin, mockUpdateTag, resetAllMocks } from '../../testing/mocks'

beforeEach(resetAllMocks)

const validCreateData = { name: 'Mercury', description: 'Liquid metal' }

describe('createMaterial', () => {
  it('rejects when not admin', async () => {
    mockRequireAdmin.mockRejectedValue(new Error('Unauthorized: admin access required'))
    await expect(createMaterial(validCreateData)).rejects.toThrow('Unauthorized')
    expect(mockPrisma.material.create).not.toHaveBeenCalled()
  })

  it('rejects invalid data (empty name)', async () => {
    await expect(createMaterial({ name: '' })).rejects.toThrow()
  })

  it('creates material and returns id + name', async () => {
    mockPrisma.material.create.mockResolvedValue({ id: 1, name: 'Mercury' })
    const result = await createMaterial(validCreateData)
    expect(result).toEqual({ success: true, data: { id: 1, name: 'Mercury' } })
    expect(mockPrisma.material.create).toHaveBeenCalledWith({
      data: { name: 'Mercury', description: 'Liquid metal' },
    })
  })

  it('creates material without optional description', async () => {
    mockPrisma.material.create.mockResolvedValue({ id: 2, name: 'Wood' })
    const result = await createMaterial({ name: 'Wood' })
    expect(result).toEqual({ success: true, data: { id: 2, name: 'Wood' } })
  })

  it('calls updateTag for materials AND barometers', async () => {
    mockPrisma.material.create.mockResolvedValue({ id: 1, name: 'Mercury' })
    await createMaterial(validCreateData)
    expect(mockUpdateTag).toHaveBeenCalledWith('materials')
    expect(mockUpdateTag).toHaveBeenCalledWith('barometers')
  })

  it('handles P2002 unique constraint (duplicate name)', async () => {
    const p2002 = new Prisma.PrismaClientKnownRequestError('Unique', {
      code: 'P2002',
      clientVersion: '5.0.0',
    })
    mockPrisma.material.create.mockRejectedValue(p2002)
    const result = await createMaterial(validCreateData)
    expect(result).toEqual({
      success: false,
      error: expect.stringContaining('Mercury'),
    })
  })

  it('returns generic error on unknown failure', async () => {
    jest.spyOn(console, 'error').mockImplementation()
    mockPrisma.material.create.mockRejectedValue(new Error('DB error'))
    const result = await createMaterial(validCreateData)
    expect(result).toEqual({
      success: false,
      error: 'Failed to create material. Please try again.',
    })
  })
})

describe('updateMaterial', () => {
  const validUpdate = { id: 1, name: 'Brass', description: 'Copper-zinc alloy' }

  it('rejects when not admin', async () => {
    mockRequireAdmin.mockRejectedValue(new Error('Unauthorized: admin access required'))
    await expect(updateMaterial(validUpdate)).rejects.toThrow('Unauthorized')
    expect(mockPrisma.material.update).not.toHaveBeenCalled()
  })

  it('rejects invalid data (missing id)', async () => {
    await expect(updateMaterial({ name: 'Brass' })).rejects.toThrow()
  })

  it('updates material and returns id + name', async () => {
    mockPrisma.material.update.mockResolvedValue({ id: 1, name: 'Brass' })
    const result = await updateMaterial(validUpdate)
    expect(result).toEqual({ success: true, data: { id: 1, name: 'Brass' } })
    expect(mockPrisma.material.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { name: 'Brass', description: 'Copper-zinc alloy' },
    })
  })

  it('calls updateTag for materials AND barometers', async () => {
    mockPrisma.material.update.mockResolvedValue({ id: 1, name: 'Brass' })
    await updateMaterial(validUpdate)
    expect(mockUpdateTag).toHaveBeenCalledWith('materials')
    expect(mockUpdateTag).toHaveBeenCalledWith('barometers')
  })

  it('handles P2002 unique constraint (duplicate name)', async () => {
    const p2002 = new Prisma.PrismaClientKnownRequestError('Unique', {
      code: 'P2002',
      clientVersion: '5.0.0',
    })
    mockPrisma.material.update.mockRejectedValue(p2002)
    const result = await updateMaterial(validUpdate)
    expect(result).toEqual({
      success: false,
      error: expect.stringContaining('Brass'),
    })
  })

  it('returns generic error on unknown failure', async () => {
    jest.spyOn(console, 'error').mockImplementation()
    mockPrisma.material.update.mockRejectedValue(new Error('DB error'))
    const result = await updateMaterial(validUpdate)
    expect(result).toEqual({
      success: false,
      error: 'Failed to update material. Please try again.',
    })
  })
})

describe('deleteMaterial', () => {
  it('rejects when not admin', async () => {
    mockRequireAdmin.mockRejectedValue(new Error('Unauthorized: admin access required'))
    await expect(deleteMaterial({ id: 1 })).rejects.toThrow('Unauthorized')
    expect(mockPrisma.material.delete).not.toHaveBeenCalled()
  })

  it('rejects invalid id', async () => {
    await expect(deleteMaterial({ id: 'abc' })).rejects.toThrow()
  })

  it('deletes material and returns id', async () => {
    mockPrisma.material.delete.mockResolvedValue({ id: 1 })
    const result = await deleteMaterial({ id: 1 })
    expect(result).toEqual({ success: true, data: { id: 1 } })
    expect(mockPrisma.material.delete).toHaveBeenCalledWith({ where: { id: 1 } })
  })

  it('calls updateTag for materials AND barometers', async () => {
    mockPrisma.material.delete.mockResolvedValue({ id: 1 })
    await deleteMaterial({ id: 1 })
    expect(mockUpdateTag).toHaveBeenCalledWith('materials')
    expect(mockUpdateTag).toHaveBeenCalledWith('barometers')
  })

  it('handles P2003 foreign key constraint (material in use)', async () => {
    const p2003 = new Prisma.PrismaClientKnownRequestError('FK', {
      code: 'P2003',
      clientVersion: '5.0.0',
    })
    mockPrisma.material.delete.mockRejectedValue(p2003)
    const result = await deleteMaterial({ id: 1 })
    expect(result).toEqual({
      success: false,
      error: 'Cannot delete material that is used by barometers',
    })
  })

  it('returns generic error on unknown failure', async () => {
    jest.spyOn(console, 'error').mockImplementation()
    mockPrisma.material.delete.mockRejectedValue(new Error('DB error'))
    const result = await deleteMaterial({ id: 1 })
    expect(result).toEqual({
      success: false,
      error: 'Failed to delete material. Please try again.',
    })
  })
})
