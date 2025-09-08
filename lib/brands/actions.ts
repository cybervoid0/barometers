'use server'

import type { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { FrontRoutes } from '@/constants'
import { withPrisma } from '@/prisma/prismaClient'
import { getBrandSlug, trimTrailingSlash } from '@/utils'

const createBrand = withPrisma(async (prisma, data: Prisma.ManufacturerUncheckedCreateInput) => {
  const { id, slug } = await prisma.manufacturer.create({
    data,
  })
  const { successors } = await prisma.manufacturer.findUniqueOrThrow({
    where: { id },
    include: { successors: { select: { slug: true } } },
  })
  revalidatePath(trimTrailingSlash(FrontRoutes.Brands))
  revalidatePath(FrontRoutes.Brands + slug)
  successors.forEach(({ slug }) => {
    revalidatePath(FrontRoutes.Brands + slug)
  })
  return { id }
})

const updateBrand = withPrisma(async (prisma, data: Prisma.ManufacturerUncheckedUpdateInput) => {
  const oldBrand = await prisma.manufacturer.findUniqueOrThrow({ where: { id: data.id as string } })
  const slug =
    data.name && data.firstName
      ? getBrandSlug(data.name as string, data.firstName as string)
      : oldBrand.slug
  const { id, name } = await prisma.manufacturer.update({
    where: {
      id: data.id as string,
    },
    data: {
      ...data,
      slug,
    },
  })
  const { successors } = await prisma.manufacturer.findUniqueOrThrow({
    where: { id },
    include: { successors: { select: { slug: true } } },
  })
  revalidatePath(trimTrailingSlash(FrontRoutes.Brands))
  revalidatePath(FrontRoutes.Brands + slug)
  successors.forEach(({ slug }) => {
    revalidatePath(FrontRoutes.Brands + slug)
  })
  return { slug, name }
})

const deleteBrand = withPrisma(async (prisma, slug: string) => {
  const manufacturer = await prisma.manufacturer.findUniqueOrThrow({ where: { slug } })
  await prisma.manufacturer.delete({
    where: {
      id: manufacturer.id,
    },
  })
  revalidatePath(trimTrailingSlash(FrontRoutes.Brands))
  revalidatePath(FrontRoutes.Brands + slug)
})

export { createBrand, updateBrand, deleteBrand }
