'use server'

import path from 'node:path'
import { minioBucket, minioClient } from '@/services/minio'
import type { ImageType } from '@/types'

async function deleteImages(fileNames?: string[]) {
  if (!Array.isArray(fileNames) || fileNames.length === 0) return
  await Promise.all(fileNames.map(deleteImage))
}

async function deleteImage(fileName: string) {
  try {
    await minioClient.removeObject(minioBucket, fileName)
  } catch (error) {
    console.error('Unable to delete image', error)
    // don't mind if it was not possible to delete the file
  }
}

function generateImageName(tempUrl: string, type: ImageType, idSuffix: string): string {
  const extension = path.extname(tempUrl)
  const random = crypto.randomUUID().slice(0, 8)
  return `gallery/${type}-${idSuffix}__${random}${extension}`
}

function createTempImage(fileName: string) {
  const tempImageName = `temp/${crypto.randomUUID()}${path.extname(fileName)}`
  return minioClient.presignedPutObject(minioBucket, tempImageName)
}

async function saveTempImage(tempUrl: string, type: ImageType, idSuffix: string) {
  const permanentName = generateImageName(tempUrl, type, idSuffix)
  await minioClient.copyObject(minioBucket, permanentName, `/${minioBucket}/${tempUrl}`)
  await minioClient.removeObject(minioBucket, tempUrl)
  return permanentName
}

export { deleteImages, deleteImage, createTempImage, saveTempImage }
