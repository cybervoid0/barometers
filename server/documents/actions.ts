'use server'

import type { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { Tag } from '@/constants'
import { withPrisma } from '@/prisma/prismaClient'

const createDocument = withPrisma(async (prisma, data: Prisma.DocumentUncheckedCreateInput) => {
  const { id, title } = await prisma.document.create({
    data,
  })
  revalidatePath(Tag.documents)
  return { id, title }
})

export { createDocument }
