/**
 * @jest-environment node
 */
jest.mock('@/prisma/prismaClient', () => require('../../testing/mocks').prismaMockModule)
jest.mock('@/server/auth', () => require('../../testing/mocks').authMockModule)
jest.mock('next/server', () => require('../../testing/mocks').serverMockModule)
jest.mock('@/services/minio', () => require('../../testing/mocks').minioMockModule)
jest.mock('@/server/files/storage', () => require('../../testing/mocks').storageMockModule)

const mockSharpInstance = {
  resize: jest.fn().mockReturnThis(),
  blur: jest.fn().mockReturnThis(),
  png: jest.fn().mockReturnThis(),
  toBuffer: jest.fn().mockResolvedValue(Buffer.from('blur')),
}
jest.mock('sharp', () => jest.fn(() => mockSharpInstance))

import { createImagesInDb } from '@/server/files/images'
import {
  mockAfter,
  mockPrisma,
  mockRequireAdmin,
  mockSaveFileToStorage,
  resetAllMocks,
} from '../../testing/mocks'

beforeEach(resetAllMocks)

const validFiles = [
  { url: 'temp/abc.jpg', name: 'photo.jpg' },
  { url: 'temp/def.png', name: 'logo.png' },
]

describe('createImagesInDb', () => {
  it('rejects when not admin', async () => {
    mockRequireAdmin.mockRejectedValue(new Error('Unauthorized: admin access required'))
    await expect(createImagesInDb(validFiles, 'b', 'suffix')).rejects.toThrow('Unauthorized')
  })

  it('rejects invalid image type', async () => {
    await expect(createImagesInDb(validFiles, 'x', 'suffix')).rejects.toThrow()
  })

  it('rejects invalid files array', async () => {
    await expect(createImagesInDb('not-array', 'b', 'suffix')).rejects.toThrow()
  })

  it('saves temp images to permanent paths', async () => {
    mockSaveFileToStorage.mockResolvedValue(undefined)
    mockPrisma.image.createManyAndReturn.mockResolvedValue([
      { id: 'img-1', url: 'gallery/b-suffix__abc.jpg' },
    ])

    await createImagesInDb(validFiles, 'b', 'suffix')
    expect(mockSaveFileToStorage).toHaveBeenCalledTimes(2)
  })

  it('skips save for non-temp URLs', async () => {
    mockSaveFileToStorage.mockResolvedValue(undefined)
    mockPrisma.image.createManyAndReturn.mockResolvedValue([
      { id: 'img-1', url: 'gallery/existing.jpg' },
    ])

    await createImagesInDb([{ url: 'gallery/existing.jpg', name: 'existing.jpg' }], 'b', 'suffix')
    expect(mockSaveFileToStorage).not.toHaveBeenCalled()
  })

  it('creates image records in DB', async () => {
    mockSaveFileToStorage.mockResolvedValue(undefined)
    mockPrisma.image.createManyAndReturn.mockResolvedValue([{ id: 'img-1', url: 'u' }])

    await createImagesInDb(validFiles, 'b', 'suffix')
    expect(mockPrisma.image.createManyAndReturn).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({ name: 'photo.jpg', order: 0 }),
        expect.objectContaining({ name: 'logo.png', order: 1 }),
      ]),
      select: { id: true, url: true },
    })
  })

  it('schedules blur data generation via after()', async () => {
    mockSaveFileToStorage.mockResolvedValue(undefined)
    mockPrisma.image.createManyAndReturn.mockResolvedValue([{ id: 'img-1', url: 'u' }])

    await createImagesInDb(validFiles, 'b', 'suffix')
    expect(mockAfter).toHaveBeenCalled()
  })
})
