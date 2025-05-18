import { Image } from '@prisma/client'
import { minioClient, minioBucket } from '@/utils/minio'

/**
 * Deletes selected images from storage
 */
export async function deleteImagesFromStorage(images: Image[]) {
  await Promise.all(
    images.map(async image => {
      try {
        await minioClient.removeObject(minioBucket, image.url)
      } catch (error) {
        // don't throw error if image was not deleted
        console.error(`Could not delete ${image.url} from storage`)
        console.error(error)
      }
    }),
  )
}
