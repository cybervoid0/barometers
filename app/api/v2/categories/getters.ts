import { PrismaClient } from '@prisma/client'

export async function getCategories(prisma: PrismaClient) {
  return prisma.category.findMany({
    orderBy: {
      order: 'asc',
    },
    select: {
      id: true,
      name: true,
      label: true,
      order: true,
      image: {
        select: {
          url: true,
        },
      },
    },
  })
}

export type CategoryListDTO = Awaited<ReturnType<typeof getCategories>>
