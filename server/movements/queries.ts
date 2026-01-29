import 'server-only'

import { cacheLife, cacheTag } from 'next/cache'
import { Tag } from '@/constants'
import { prisma } from '@/prisma/prismaClient'

export async function getMovements() {
  'use cache'
  cacheLife('max')
  cacheTag(Tag.movements)

  const subCats = await prisma.subCategory.findMany({
    orderBy: [
      {
        name: 'asc',
      },
    ],
  })
  // case insensitive sorting is not supported in Prisma on the DB level
  return subCats.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
}

export type MovementsDTO = Awaited<ReturnType<typeof getMovements>>
