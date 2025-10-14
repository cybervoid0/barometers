'use server'

import path from 'node:path'
import { minioBucket, minioClient } from '@/services/minio'
import type { MediaFile } from '@/types'

async function deleteFiles(fileNames?: MediaFile[]) {
  if (!Array.isArray(fileNames) || fileNames.length === 0) return
  await Promise.all(fileNames.map(deleteFile))
}

async function deleteFile(file: MediaFile) {
  try {
    await minioClient.removeObject(minioBucket, file.url)
  } catch (error) {
    console.error('Unable to delete image', error)
    // don't mind if it was not possible to delete the file
  }
}

async function saveFile(tempUrl: string, filename: string) {
  await minioClient.copyObject(minioBucket, filename, `/${minioBucket}/${tempUrl}`)
  await minioClient.removeObject(minioBucket, tempUrl)
}

function createTempFile(fileName: string) {
  const tempImageName = `temp/${crypto.randomUUID()}${path.extname(fileName)}`
  return minioClient.presignedPutObject(minioBucket, tempImageName)
}

export { deleteFiles, deleteFile, createTempFile, saveFile }
