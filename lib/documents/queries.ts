'use server'

import { cache } from 'react'
import { withPrisma } from '@/prisma/prismaClient'

const getDocuments = withPrisma(async prisma => {
  return prisma.document.findMany({
    select: {
      id: true,
      title: true,
    },
  })
})

const getDocument = cache(
  withPrisma(async (prisma, id: string) => {
    return prisma.document.findUnique({ where: { id } })
  }),
)

export { getDocuments, getDocument }
