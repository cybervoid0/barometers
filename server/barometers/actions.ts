'use server'

import type { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { FrontRoutes } from '@/constants'
import { withPrisma } from '@/prisma/prismaClient'
import { revalidateCategory, slug as slugify, trimTrailingSlash } from '@/utils'
import { deleteImages } from '../images/actions'

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
  const imagesBeforeDbUpdate = (
    await prisma.image.findMany({
      ...args,
      select: {
        url: true,
      },
    })
  ).map(({ url }) => url)
  await prisma.$transaction(async tx => {
    await tx.image.deleteMany(args)
    await tx.barometer.delete({
      where: {
        id: barometer.id,
      },
    })
  })
  await deleteImages(imagesBeforeDbUpdate)
  revalidatePath(FrontRoutes.Barometer + barometer.slug)
  revalidatePath(trimTrailingSlash(FrontRoutes.NewArrivals))
  await revalidateCategory(prisma, barometer.categoryId)
})

export { createBarometer, updateBarometer, deleteBarometer }
