import { withPrisma } from '@/prisma/prismaClient'

export const getMaterials = withPrisma(prisma =>
  prisma.material.findMany({
    orderBy: {
      name: 'asc',
    },
  }),
)

export type MaterialList = Awaited<ReturnType<typeof getMaterials>>
