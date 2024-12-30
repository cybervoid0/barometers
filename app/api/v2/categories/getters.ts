import { withPrisma } from '@/prisma/prismaClient'

export const getCategories = withPrisma(prisma =>
  prisma.category.findMany({
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
          blurData: true,
        },
      },
    },
  }),
)

export type CategoryListDTO = Awaited<ReturnType<typeof getCategories>>
