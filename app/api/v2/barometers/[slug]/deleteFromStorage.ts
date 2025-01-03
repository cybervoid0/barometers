import { Image } from '@prisma/client'
import bucket from '@/utils/googleStorage'

/**
 * Deletes selected Google Storage images
 */
export async function deleteImagesFromGoogleStorage(images: Image[]) {
  await Promise.all(
    images.map(async image => {
      try {
        await bucket.file(image.url).delete()
      } catch (error) {
        // don't throw error if image was not deleted
        console.error(`Could not delete ${image.url} from Google Storage`)
        console.error(error)
      }
    }),
  )
}
