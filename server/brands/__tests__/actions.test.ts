/**
 * @jest-environment node
 */
jest.mock('@/prisma/prismaClient', () => require('../../testing/mocks').prismaMockModule)
jest.mock('@/server/auth', () => require('../../testing/mocks').authMockModule)
jest.mock('next/cache', () => require('../../testing/mocks').cacheMockModule)
jest.mock('@/utils', () => require('../../testing/mocks').utilsMockModule)

import { Prisma } from '@prisma/client'
import { createBrand, deleteBrand, updateBrand } from '@/server/brands/actions'
import { mockPrisma, mockRequireAdmin, mockUpdateTag, resetAllMocks } from '../../testing/mocks'

beforeEach(resetAllMocks)

const validCreateData = {
  firstName: 'John',
  name: 'Negretti',
  slug: 'negretti',
  city: 'London',
  url: '',
  description: 'A brand',
  icon: null,
  countries: { connect: [{ id: 1 }] },
  successors: { connect: [] as { id: string }[] },
}

describe('createBrand', () => {
  it('rejects when not admin', async () => {
    mockRequireAdmin.mockRejectedValue(new Error('Unauthorized: admin access required'))
    await expect(createBrand(validCreateData)).rejects.toThrow('Unauthorized')
    expect(mockPrisma.manufacturer.create).not.toHaveBeenCalled()
  })

  it('rejects invalid data (missing name)', async () => {
    const { name, ...noName } = validCreateData
    await expect(createBrand(noName)).rejects.toThrow()
  })

  it('creates brand with icon buffer', async () => {
    mockPrisma.manufacturer.create.mockResolvedValue({ id: 'm-1', name: 'Negretti' })
    const result = await createBrand({ ...validCreateData, icon: 'svg-data' })
    expect(result).toEqual({ success: true, data: { id: 'm-1', name: 'Negretti' } })
    expect(mockPrisma.manufacturer.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ icon: expect.any(Buffer) }),
      }),
    )
  })

  it('calls updateTag for brands AND barometers', async () => {
    mockPrisma.manufacturer.create.mockResolvedValue({ id: 'm-1', name: 'Negretti' })
    await createBrand(validCreateData)
    expect(mockUpdateTag).toHaveBeenCalledWith('brands')
    expect(mockUpdateTag).toHaveBeenCalledWith('barometers')
  })

  it('returns P2002 message with brand name', async () => {
    jest.spyOn(console, 'error').mockImplementation()
    const p2002 = new Prisma.PrismaClientKnownRequestError('Unique', {
      code: 'P2002',
      clientVersion: '5.0.0',
    })
    mockPrisma.manufacturer.create.mockRejectedValue(p2002)
    const result = await createBrand(validCreateData)
    expect(result).toEqual({
      success: false,
      error: expect.stringContaining('Negretti'),
    })
  })

  it('returns generic error on non-P2002 failure', async () => {
    jest.spyOn(console, 'error').mockImplementation()
    mockPrisma.manufacturer.create.mockRejectedValue(new Error('DB error'))
    const result = await createBrand(validCreateData)
    expect(result).toEqual({
      success: false,
      error: 'Failed to create brand. Please try again.',
    })
  })
})

describe('updateBrand', () => {
  it('rejects when not admin', async () => {
    mockRequireAdmin.mockRejectedValue(new Error('Unauthorized: admin access required'))
    await expect(updateBrand({ id: 'm-1', name: 'X' })).rejects.toThrow('Unauthorized')
  })

  it('updates brand with validated data', async () => {
    mockPrisma.manufacturer.update.mockResolvedValue({ slug: 'updated', name: 'Updated' })
    const result = await updateBrand({ id: 'm-1', name: 'Updated', icon: null })
    expect(result).toEqual({ success: true, data: { slug: 'updated', name: 'Updated' } })
  })

  it('returns error on update failure', async () => {
    jest.spyOn(console, 'error').mockImplementation()
    mockPrisma.manufacturer.update.mockRejectedValue(new Error('DB error'))
    const result = await updateBrand({ id: 'm-1', name: 'X', icon: null })
    expect(result).toEqual({ success: false, error: 'Failed to update brand. Please try again.' })
  })

  it('handles icon conversion', async () => {
    mockPrisma.manufacturer.update.mockResolvedValue({ slug: 's', name: 'N' })
    await updateBrand({ id: 'm-1', name: 'N', icon: 'svg-data' })
    expect(mockPrisma.manufacturer.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ icon: expect.any(Buffer) }),
      }),
    )
  })
})

describe('deleteBrand', () => {
  it('rejects when not admin', async () => {
    mockRequireAdmin.mockRejectedValue(new Error('Unauthorized: admin access required'))
    await expect(deleteBrand('test')).rejects.toThrow('Unauthorized')
  })

  it('rejects invalid slug', async () => {
    await expect(deleteBrand(123)).rejects.toThrow()
  })

  it('finds by slug then deletes by id', async () => {
    mockPrisma.manufacturer.findUniqueOrThrow.mockResolvedValue({ id: 'm-1' })
    mockPrisma.manufacturer.delete.mockResolvedValue({})
    await deleteBrand('test-slug')
    expect(mockPrisma.manufacturer.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { slug: 'test-slug' },
    })
    expect(mockPrisma.manufacturer.delete).toHaveBeenCalledWith({ where: { id: 'm-1' } })
  })

  it('throws when slug not found', async () => {
    mockPrisma.manufacturer.findUniqueOrThrow.mockRejectedValue(new Error('Not found'))
    await expect(deleteBrand('nonexistent')).rejects.toThrow('Not found')
  })
})
