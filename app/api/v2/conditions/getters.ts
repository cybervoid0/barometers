import { PrismaClient } from '@prisma/client'

export async function getConditions(prisma: PrismaClient) {
  return prisma.condition.findMany({
    orderBy: {
      value: 'asc',
    },
    select: {
      id: true,
      name: true,
      value: true,
      description: true,
    },
  })
}

export type ConditionListDTO = Awaited<ReturnType<typeof getConditions>>
