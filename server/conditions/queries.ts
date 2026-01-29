import 'server-only'

import { cacheLife, cacheTag } from 'next/cache'
import { Tag } from '@/constants'
import { prisma } from '@/prisma/prismaClient'

export async function getConditions() {
  'use cache'
  cacheLife('max')
  cacheTag(Tag.conditions)

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

export type ConditionsDTO = Awaited<ReturnType<typeof getConditions>>
