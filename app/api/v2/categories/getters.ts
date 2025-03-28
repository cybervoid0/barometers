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

export type CategoryListDTO = Awaited<ReturnType<typeof getCategories>>
