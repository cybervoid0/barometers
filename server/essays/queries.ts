import 'server-only'

import { cacheLife, cacheTag } from 'next/cache'
import { Tag } from '@/constants'
import { prisma } from '@/prisma/prismaClient'

export async function getAllEssays() {
  'use cache'
  cacheLife('max')
  cacheTag(Tag.essays)

  return prisma.essay.findMany({
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
  })
}
export type AllEssaysDTO = Awaited<ReturnType<typeof getAllEssays>>
