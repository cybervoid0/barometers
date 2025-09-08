'use server'

import type { Prisma } from '@prisma/client'
import { withPrisma } from '@/prisma/prismaClient'

const createDocument = withPrisma(async (prisma, data: Prisma.DocumentUncheckedCreateInput) => {
  const { id, title } = await prisma.document.create({
    data,
  })
  return { id, title }
})

export { createDocument }
