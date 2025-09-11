'use server'

import type { Image, Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { FrontRoutes } from '@/constants'
import { withPrisma } from '@/prisma/prismaClient'
import { minioBucket, minioClient } from '@/services/minio'
import { revalidateCategory, slug as slugify, trimTrailingSlash } from '@/utils'

const createBarometer = withPrisma(async (prisma, data: Prisma.BarometerUncheckedCreateInput) => {
  const { id, categoryId } = await prisma.barometer.create({
    data,
  })
  await revalidateCategory(prisma, categoryId)
  revalidatePath(trimTrailingSlash(FrontRoutes.NewArrivals)) // regenerate new arrivals page
  return { id }
})

const updateBarometer = withPrisma(async (prisma, data: Prisma.BarometerUncheckedUpdateInput) => {
  const oldBarometer = await prisma.barometer.findUniqueOrThrow({
    where: { id: data.id as string },
  })
  // create new slug if name changed
  const slug = data.name ? slugify(data.name as string) : oldBarometer.slug
  await prisma.barometer.update({
    where: { id: data.id as string },
    data: {
      ...data,
      slug,
    },
  })
  revalidatePath(FrontRoutes.Barometer + slug)
  await revalidateCategory(prisma, (data.categoryId as string) ?? oldBarometer.categoryId)
  const name = data.name ?? oldBarometer.name
  return { slug, name }
})

/**
 * Deletes selected images from storage
 */
async function deleteImagesFromStorage(images: Image[]) {
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

const deleteBarometer = withPrisma(async (prisma, slug: string) => {
  const barometer = await prisma.barometer.findFirstOrThrow({
    where: {
      slug: {
        equals: slug,
        mode: 'insensitive',
      },
    },
  })

  const args = {
    where: { barometers: { some: { id: barometer.id } } },
  }
  // save deleting images info
  const imagesBeforeDbUpdate = await prisma.image.findMany(args)
  await prisma.$transaction(async tx => {
    await tx.image.deleteMany(args)
    await tx.barometer.delete({
      where: {
        id: barometer.id,
      },
    })
  })
  await deleteImagesFromStorage(imagesBeforeDbUpdate)
  revalidatePath(FrontRoutes.Barometer + barometer.slug)
  revalidatePath(trimTrailingSlash(FrontRoutes.NewArrivals))
  await revalidateCategory(prisma, barometer.categoryId)
})

export { createBarometer, updateBarometer, deleteBarometer }
