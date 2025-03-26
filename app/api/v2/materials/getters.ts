import { withPrisma } from '@/prisma/prismaClient'

export const getMaterials = withPrisma(prisma =>
  prisma.material.findMany({
    orderBy: {
      name: 'asc',
    },
  }),
)

export type MaterialListDTO = Awaited<ReturnType<typeof getMaterials>>
