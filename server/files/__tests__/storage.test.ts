/**
 * @jest-environment node
 */
jest.mock('@/services/minio', () => require('../../testing/mocks').minioMockModule)

import {
  createPresignedUrl,
  deleteFileFromStorage,
  saveFileToStorage,
} from '@/server/files/storage'
import { mockMinioClient } from '../../testing/mocks'

beforeEach(() => jest.clearAllMocks())

describe('deleteFileFromStorage', () => {
  it('calls removeObject', async () => {
    await deleteFileFromStorage({ url: 'gallery/a.jpg', name: 'a.jpg' })
    expect(mockMinioClient.removeObject).toHaveBeenCalledWith('test-bucket', 'gallery/a.jpg')
  })

  it('swallows errors and logs', async () => {
    mockMinioClient.removeObject.mockRejectedValueOnce(new Error('network'))
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    await deleteFileFromStorage({ url: 'gallery/a.jpg', name: 'a.jpg' })
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })
})

describe('saveFileToStorage', () => {
  it('copies then removes', async () => {
    await saveFileToStorage('temp/a.jpg', 'gallery/a.jpg')
    expect(mockMinioClient.copyObject).toHaveBeenCalledWith(
      'test-bucket',
      'gallery/a.jpg',
      '/test-bucket/temp/a.jpg',
    )
    expect(mockMinioClient.removeObject).toHaveBeenCalledWith('test-bucket', 'temp/a.jpg')
  })
})

describe('createPresignedUrl', () => {
  it('generates temp/ path with correct extension', async () => {
    mockMinioClient.presignedPutObject.mockResolvedValue('https://presigned.url')
    const result = await createPresignedUrl('photo.jpg')
    expect(result).toBe('https://presigned.url')
    expect(mockMinioClient.presignedPutObject).toHaveBeenCalledWith(
      'test-bucket',
      expect.stringMatching(/^temp\/.*\.jpg$/),
    )
  })
})
