import 'server-only'

import { withPrisma } from '@/prisma/prismaClient'

export const getCategories = withPrisma(async prisma => {
  const categories = await prisma.category.findMany({
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
})

export type CategoriesDTO = Awaited<ReturnType<typeof getCategories>>

export const getCategory = withPrisma(async (prisma, name: string) => {
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
})

export type CategoryDTO = Awaited<ReturnType<typeof getCategory>>
