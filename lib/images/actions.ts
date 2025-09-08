'use server'

import { minioBucket, minioClient } from '@/services/minio'

async function deleteImages(fileNames?: string[]) {
  if (!Array.isArray(fileNames) || fileNames.length === 0) return
  await Promise.all(
    fileNames.map(async file => {
      try {
        await minioClient.removeObject(minioBucket, file)
      } catch (error) {
        console.error('Unable to delete image', error)
        // don't mind if it was not possible to delete the file
      }
    }),
  )
}

export { deleteImages }
