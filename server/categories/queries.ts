import 'server-only'

import type { CategoryLocation } from '@prisma/client'
import { cacheLife, cacheTag } from 'next/cache'
import { notFound } from 'next/navigation'
import { isRouteKey, Route, Tag } from '@/constants'
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
  return categories.map(({ images: [image], label, ...category }) => {
    if (!isRouteKey(label)) throw new Error(`A category ${label} doesn't exist in the app`)
    return {
      ...category,
      label,
      image,
      link: Route[label],
    }
  })
}

export async function getCategory(name: string) {
  'use cache'
  cacheLife('max')
  cacheTag(Tag.categories)

  const result = await prisma.category.findFirst({
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
  if (!result) notFound()
  const {
    images: [image],
    label,
    ...category
  } = result
  if (!isRouteKey(label)) throw new Error(`A category ${label} doesn't exist in the app`)
  return {
    ...category,
    image,
    label,
    link: Route[label],
  }
}

export type CategoryDTO = Awaited<ReturnType<typeof getCategory>>
export type CategoriesDTO = Awaited<ReturnType<typeof getCategories>>
