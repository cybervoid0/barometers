/**
 * @jest-environment node
 */
jest.mock('@/prisma/prismaClient', () => require('../../testing/mocks').prismaMockModule)
jest.mock('@/server/auth', () => require('../../testing/mocks').authMockModule)
jest.mock('next/cache', () => require('../../testing/mocks').cacheMockModule)
jest.mock('@/utils', () => require('../../testing/mocks').utilsMockModule)
jest.mock('@/server/files/actions', () => ({ deleteFiles: jest.fn() }))
jest.mock('next/server', () => require('../../testing/mocks').serverMockModule)
jest.mock('@/server/files/storage', () => require('../../testing/mocks').storageMockModule)

import { Prisma } from '@prisma/client'
import { createBarometer, deleteBarometer, updateBarometer } from '@/server/barometers/actions'
import { deleteFiles } from '@/server/files/actions'
import {
  mockPrisma,
  mockRequireAdmin,
  mockSaveFileToStorage,
  mockUpdateTag,
  resetAllMocks,
} from '../../testing/mocks'

const mockDeleteFiles = deleteFiles as jest.Mock

beforeEach(resetAllMocks)

const validCreateData = {
  collectionId: 'CAT-001',
  name: 'Test Barometer',
  slug: 'test-barometer',
  categoryId: 'cat-1',
  date: new Date('2020-01-01'),
  dateDescription: 'circa 2020',
  manufacturerId: 'mfr-1',
  conditionId: 'cond-1',
}

describe('createBarometer', () => {
  it('rejects when not admin', async () => {
    mockRequireAdmin.mockRejectedValue(new Error('Unauthorized: admin access required'))
    await expect(createBarometer(validCreateData)).rejects.toThrow('Unauthorized')
    expect(mockPrisma.barometer.create).not.toHaveBeenCalled()
  })

  it('rejects invalid data (missing name)', async () => {
    const { name, ...noName } = validCreateData
    await expect(createBarometer(noName)).rejects.toThrow()
    expect(mockPrisma.barometer.create).not.toHaveBeenCalled()
  })

  it('creates barometer on valid input', async () => {
    mockPrisma.barometer.create.mockResolvedValue({ id: 'b-1', images: [] })
    const result = await createBarometer(validCreateData)
    expect(result).toEqual({ success: true, data: { id: 'b-1' } })
    expect(mockPrisma.barometer.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ ...validCreateData, description: '' }),
      }),
    )
  })

  it('returns P2002 message with name and collectionId', async () => {
    jest.spyOn(console, 'error').mockImplementation()
    const p2002 = new Prisma.PrismaClientKnownRequestError('Unique', {
      code: 'P2002',
      clientVersion: '5.0.0',
    })
    mockPrisma.barometer.create.mockRejectedValue(p2002)
    const result = await createBarometer(validCreateData)
    expect(result).toEqual({
      success: false,
      error: expect.stringContaining('Test Barometer'),
    })
  })

  it('returns generic error on non-P2002 failure', async () => {
    jest.spyOn(console, 'error').mockImplementation()
    mockPrisma.barometer.create.mockRejectedValue(new Error('DB error'))
    const result = await createBarometer(validCreateData)
    expect(result).toEqual({
      success: false,
      error: 'Failed to create barometer. Please try again.',
    })
  })

  it('calls updateTag on success', async () => {
    mockPrisma.barometer.create.mockResolvedValue({ id: 'b-1', images: [] })
    await createBarometer(validCreateData)
    expect(mockUpdateTag).toHaveBeenCalledWith('barometers')
  })

  it('persists temp images and nests them into the create', async () => {
    mockSaveFileToStorage.mockResolvedValue(undefined)
    mockPrisma.barometer.create.mockResolvedValue({
      id: 'b-1',
      images: [{ id: 'i-1', url: 'gallery/x.jpg' }],
    })

    await createBarometer({
      ...validCreateData,
      images: [{ url: 'temp/abc.jpg', name: 'photo.jpg' }],
    })

    expect(mockSaveFileToStorage).toHaveBeenCalledWith(
      'temp/abc.jpg',
      expect.stringContaining('gallery/'),
    )
    expect(mockPrisma.barometer.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          images: {
            create: expect.arrayContaining([
              expect.objectContaining({ name: 'photo.jpg', order: 0 }),
            ]),
          },
        }),
      }),
    )
  })

  it('accepts an image with an empty name (nullable DB column)', async () => {
    mockSaveFileToStorage.mockResolvedValue(undefined)
    mockPrisma.barometer.create.mockResolvedValue({ id: 'b-1', images: [{ id: 'i', url: 'u' }] })

    const result = await createBarometer({
      ...validCreateData,
      images: [{ url: 'temp/abc.jpg', name: '' }],
    })
    expect(result).toEqual({ success: true, data: { id: 'b-1' } })
  })
})

describe('updateBarometer', () => {
  const validUpdate = { id: 'b-1', name: 'Updated Name' }

  it('rejects when not admin', async () => {
    mockRequireAdmin.mockRejectedValue(new Error('Unauthorized: admin access required'))
    await expect(updateBarometer(validUpdate)).rejects.toThrow('Unauthorized')
    expect(mockPrisma.barometer.findUniqueOrThrow).not.toHaveBeenCalled()
  })

  it('rejects invalid data (missing id)', async () => {
    await expect(updateBarometer({ name: 'No Id' })).rejects.toThrow()
  })

  it('generates new slug when name changes', async () => {
    mockPrisma.barometer.findUniqueOrThrow.mockResolvedValue({
      id: 'b-1',
      slug: 'old-slug',
      name: 'Old Name',
    })
    mockPrisma.barometer.update.mockResolvedValue({})
    const result = await updateBarometer(validUpdate)
    expect(result.success).toBe(true)
    expect(mockPrisma.barometer.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ slug: 'updated-name' }),
      }),
    )
  })

  it('keeps old slug when name unchanged', async () => {
    mockPrisma.barometer.findUniqueOrThrow.mockResolvedValue({
      id: 'b-1',
      slug: 'old-slug',
      name: 'Old Name',
    })
    mockPrisma.barometer.update.mockResolvedValue({})
    const result = await updateBarometer({ id: 'b-1', conditionId: 'c-2' })
    expect(result.success).toBe(true)
    expect(mockPrisma.barometer.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ slug: 'old-slug' }),
      }),
    )
  })

  it('returns P2002 error on unique violation', async () => {
    jest.spyOn(console, 'error').mockImplementation()
    mockPrisma.barometer.findUniqueOrThrow.mockResolvedValue({
      id: 'b-1',
      slug: 'old',
      name: 'Old',
    })
    const p2002 = new Prisma.PrismaClientKnownRequestError('Unique', {
      code: 'P2002',
      clientVersion: '5.0.0',
    })
    mockPrisma.barometer.update.mockRejectedValue(p2002)
    const result = await updateBarometer(validUpdate)
    expect(result).toEqual({
      success: false,
      error: 'This value is already used in another barometer',
    })
  })

  it('calls updateTag on success', async () => {
    mockPrisma.barometer.findUniqueOrThrow.mockResolvedValue({ id: 'b-1', slug: 's', name: 'N' })
    mockPrisma.barometer.update.mockResolvedValue({})
    await updateBarometer({ id: 'b-1', conditionId: 'c-1' })
    expect(mockUpdateTag).toHaveBeenCalledWith('barometers')
  })

  it('replaces the whole image set (deleteMany + create) when images are provided', async () => {
    mockSaveFileToStorage.mockResolvedValue(undefined)
    mockPrisma.barometer.findUniqueOrThrow.mockResolvedValue({ id: 'b-1', slug: 's', name: 'N' })
    mockPrisma.barometer.update.mockResolvedValue({ images: [{ id: 'i-1', url: 'gallery/x.jpg' }] })

    await updateBarometer({ id: 'b-1', images: [{ url: 'temp/new.jpg', name: 'new.jpg' }] })

    expect(mockPrisma.barometer.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          images: {
            deleteMany: {},
            create: expect.arrayContaining([
              expect.objectContaining({ name: 'new.jpg', order: 0 }),
            ]),
          },
        }),
      }),
    )
  })

  it('leaves images untouched when none are provided', async () => {
    mockPrisma.barometer.findUniqueOrThrow.mockResolvedValue({ id: 'b-1', slug: 's', name: 'N' })
    mockPrisma.barometer.update.mockResolvedValue({})
    await updateBarometer({ id: 'b-1', conditionId: 'c-1' })
    expect(mockSaveFileToStorage).not.toHaveBeenCalled()
    expect(mockPrisma.barometer.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ images: undefined }) }),
    )
  })
})

describe('deleteBarometer', () => {
  it('rejects when not admin', async () => {
    jest.spyOn(console, 'error').mockImplementation()
    mockRequireAdmin.mockRejectedValue(new Error('Unauthorized: admin access required'))
    const result = await deleteBarometer('test-slug')
    expect(result).toEqual(expect.objectContaining({ success: false }))
  })

  it('rejects non-string slug', async () => {
    jest.spyOn(console, 'error').mockImplementation()
    const result = await deleteBarometer(123)
    expect(result).toEqual(expect.objectContaining({ success: false }))
  })

  it('deletes barometer with images in transaction', async () => {
    const images = [{ url: 'gallery/img.jpg', name: 'img.jpg' }]
    mockPrisma.barometer.findFirstOrThrow.mockResolvedValue({ id: 'b-1' })
    mockPrisma.image.findMany.mockResolvedValue(images)
    mockPrisma.image.deleteMany.mockResolvedValue({})
    mockPrisma.barometer.delete.mockResolvedValue({})

    const result = await deleteBarometer('test-slug')
    expect(result).toEqual({ success: true, data: { id: 'b-1' } })
    expect(mockPrisma.$transaction).toHaveBeenCalled()
    expect(mockDeleteFiles).toHaveBeenCalledWith(images)
  })

  it('calls updateTag after delete', async () => {
    mockPrisma.barometer.findFirstOrThrow.mockResolvedValue({ id: 'b-1' })
    mockPrisma.image.findMany.mockResolvedValue([])
    mockPrisma.image.deleteMany.mockResolvedValue({})
    mockPrisma.barometer.delete.mockResolvedValue({})
    await deleteBarometer('test-slug')
    expect(mockUpdateTag).toHaveBeenCalledWith('barometers')
  })
})
