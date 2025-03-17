import { withPrisma } from '@/prisma/prismaClient'

export const getSubcategories = withPrisma(prisma =>
  prisma.subCategory.findMany({
    orderBy: {
      name: 'asc',
    },
  }),
)
