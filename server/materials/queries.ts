import 'server-only'

import { cacheLife, cacheTag } from 'next/cache'
import { Tag } from '@/constants'
import { prisma } from '@/prisma/prismaClient'

export async function getMaterials() {
  'use cache'
  cacheLife('max')
  cacheTag(Tag.materials)

  return prisma.material.findMany({
    orderBy: {
      name: 'asc',
    },
  })
}

export type MaterialsDTO = Awaited<ReturnType<typeof getMaterials>>
