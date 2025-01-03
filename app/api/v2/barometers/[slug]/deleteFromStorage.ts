import { Prisma, PrismaClient } from '@prisma/client'
import bucket from '@/utils/googleStorage'

/**
 * Deletes all Google Storage images of the selected barometer
 */
export async function deleteImagesFromGoogleStorage(prisma: PrismaClient, barometerId: string) {
  const imageArgs: Prisma.ImageFindManyArgs = {
    where: { barometers: { some: { id: barometerId } } },
  }
  const images = await prisma.image.findMany(imageArgs)
  await Promise.all(
    images.map(async image => {
      try {
        await bucket.file(image.url).delete()
      } catch (error) {
        console.error(`Could not delete ${image.url} from Google Storage`)
        console.error(error)
      }
    }),
  )
}
