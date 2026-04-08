import 'server-only'

import type { CategoryLocation } from '@prisma/client'
import { cacheLife, cacheTag } from 'next/cache'
import { Tag } from '@/constants'
import { prisma } from '@/prisma/prismaClient'

export async function getCategories(location?: CategoryLocation) {
  'use cache'
  cacheLife('max')
  cacheTag(Tag.categories)

  const categories = await prisma.category.findMany({
    where: location ? { location: { has: location } } : undefined,
    orderBy: {
      order: 'asc',
    },
    select: {
      id: true,
      name: true,
      label: true,
      order: true,
      images: {
        select: {
          url: true,
          blurData: true,
        },
      },
    },
  })
  return categories.map(({ images: [image], ...category }) => ({
    ...category,
    image,
  }))
}

export async function getCategory(name: string) {
  'use cache'
  cacheLife('max')
  cacheTag(Tag.categories)

  const {
    images: [image],
    ...category
  } = await prisma.category.findFirstOrThrow({
    where: {
      name: {
        equals: name,
        mode: 'insensitive',
      },
    },
    select: {
      id: true,
      name: true,
      description: true,
      order: true,
      label: true,
      images: {
        select: {
          url: true,
          blurData: true,
        },
      },
    },
  })
  return {
    ...category,
    image,
  }
}

export type CategoryDTO = Awaited<ReturnType<typeof getCategory>>
export type CategoriesDTO = Awaited<ReturnType<typeof getCategories>>
