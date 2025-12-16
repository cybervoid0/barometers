'use server'

import type { Prisma } from '@prisma/client'
import { revalidateTag } from 'next/cache'
import { Tag } from '@/constants'
import { withPrisma } from '@/prisma/prismaClient'

const createDocument = withPrisma(async (prisma, data: Prisma.DocumentUncheckedCreateInput) => {
  const { id, title } = await prisma.document.create({
    data,
  })
  revalidateTag(Tag.documents, 'max')
  return { id, title }
})

export { createDocument }
