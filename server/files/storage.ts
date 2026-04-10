import path from 'node:path'
import { minioBucket, minioClient } from '@/services/minio'
import type { MediaFile } from '@/types'

export async function deleteFileFromStorage(file: MediaFile) {
  try {
    await minioClient.removeObject(minioBucket, file.url)
  } catch (error) {
    console.error('Unable to delete image', error)
  }
}

export async function saveFileToStorage(tempUrl: string, filename: string) {
  await minioClient.copyObject(minioBucket, filename, `/${minioBucket}/${tempUrl}`)
  await minioClient.removeObject(minioBucket, tempUrl)
}

export async function createPresignedUrl(fileName: string) {
  const tempImageName = `temp/${crypto.randomUUID()}${path.extname(fileName)}`
  return minioClient.presignedPutObject(minioBucket, tempImageName)
}
