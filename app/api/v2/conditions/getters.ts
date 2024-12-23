import { withPrisma } from '@/prisma/prismaClient'

export const getConditions = withPrisma(prisma =>
  prisma.condition.findMany({
    orderBy: {
      value: 'asc',
    },
    select: {
      id: true,
      name: true,
      value: true,
      description: true,
    },
  }),
)

export type ConditionListDTO = Awaited<ReturnType<typeof getConditions>>
