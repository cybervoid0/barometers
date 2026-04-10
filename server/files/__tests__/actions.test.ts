/**
 * @jest-environment node
 */
jest.mock('@/server/auth', () => require('../../testing/mocks').authMockModule)
jest.mock('@/server/files/storage', () => require('../../testing/mocks').storageMockModule)
jest.mock('@/server/files/schemas', () => ({
  mediaFileSchema: jest.requireActual('../../files/schemas').mediaFileSchema,
}))

import { createTempFile, deleteFile, deleteFiles, saveFile } from '@/server/files/actions'
import {
  mockCreatePresignedUrl,
  mockDeleteFileFromStorage,
  mockRequireAdmin,
  mockSaveFileToStorage,
  resetAllMocks,
} from '../../testing/mocks'

beforeEach(resetAllMocks)

describe('deleteFiles', () => {
  it('rejects when not admin', async () => {
    mockRequireAdmin.mockRejectedValue(new Error('Unauthorized: admin access required'))
    await expect(deleteFiles([{ url: 'a.jpg', name: 'a' }])).rejects.toThrow('Unauthorized')
  })

  it('no-op when undefined', async () => {
    await deleteFiles(undefined)
    expect(mockDeleteFileFromStorage).not.toHaveBeenCalled()
  })

  it('no-op when empty array', async () => {
    await deleteFiles([])
    expect(mockDeleteFileFromStorage).not.toHaveBeenCalled()
  })

  it('deletes each file from storage', async () => {
    await deleteFiles([
      { url: 'gallery/a.jpg', name: 'a.jpg' },
      { url: 'gallery/b.jpg', name: 'b.jpg' },
    ])
    expect(mockDeleteFileFromStorage).toHaveBeenCalledTimes(2)
  })

  it('rejects invalid MediaFile shape', async () => {
    await expect(deleteFiles([{ bad: true }])).rejects.toThrow()
  })
})

describe('deleteFile', () => {
  it('rejects when not admin', async () => {
    mockRequireAdmin.mockRejectedValue(new Error('Unauthorized: admin access required'))
    await expect(deleteFile({ url: 'a.jpg', name: 'a' })).rejects.toThrow('Unauthorized')
  })

  it('deletes single file', async () => {
    await deleteFile({ url: 'gallery/a.jpg', name: 'a.jpg' })
    expect(mockDeleteFileFromStorage).toHaveBeenCalledWith({ url: 'gallery/a.jpg', name: 'a.jpg' })
  })

  it('rejects invalid input', async () => {
    await expect(deleteFile('not-an-object')).rejects.toThrow()
  })
})

describe('saveFile', () => {
  it('rejects when not admin', async () => {
    mockRequireAdmin.mockRejectedValue(new Error('Unauthorized: admin access required'))
    await expect(saveFile('temp/a.jpg', 'gallery/a.jpg')).rejects.toThrow('Unauthorized')
  })

  it('calls saveFileToStorage with validated args', async () => {
    await saveFile('temp/a.jpg', 'gallery/a.jpg')
    expect(mockSaveFileToStorage).toHaveBeenCalledWith('temp/a.jpg', 'gallery/a.jpg')
  })

  it('rejects empty strings', async () => {
    await expect(saveFile('', 'gallery/a.jpg')).rejects.toThrow()
  })
})

describe('createTempFile', () => {
  it('rejects when not admin', async () => {
    mockRequireAdmin.mockRejectedValue(new Error('Unauthorized: admin access required'))
    await expect(createTempFile('photo.jpg')).rejects.toThrow('Unauthorized')
  })

  it('returns presigned URL', async () => {
    mockCreatePresignedUrl.mockResolvedValue('https://minio.test/presigned')
    const result = await createTempFile('photo.jpg')
    expect(result).toBe('https://minio.test/presigned')
  })

  it('rejects empty filename', async () => {
    await expect(createTempFile('')).rejects.toThrow()
  })
})
