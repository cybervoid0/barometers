import 'server-only'

import { cacheLife, cacheTag } from 'next/cache'
import { DEFAULT_PAGE_SIZE, Tag } from '@/constants'
import { withPrisma } from '@/prisma/prismaClient'

const getAllDocuments = withPrisma(async prisma => {
  'use cache'
  cacheLife('max')
  cacheTag(Tag.documents)

  return prisma.document.findMany({
    include: {
      images: {
        orderBy: {
          order: 'asc',
        },
      },
      condition: {
        select: {
          name: true,
        },
      },
      relatedBarometers: {
        select: {
          id: true,
        },
      },
    },
  })
})
type AllDocumentsDTO = Awaited<ReturnType<typeof getAllDocuments>>

const getDocuments = withPrisma(
  async (prisma, pageNo: number = 1, pageSize: number = DEFAULT_PAGE_SIZE) => {
    'use cache'
    cacheLife('max')
    cacheTag(Tag.documents)

    const skip = (pageNo - 1) * pageSize
    const [documents, docCount] = await Promise.all([
      prisma.document.findMany({
        include: {
          images: {
            orderBy: {
              order: 'asc',
            },
          },
          condition: {
            select: {
              name: true,
            },
          },
        },
        skip,
        take: pageSize,
        orderBy: {
          createdAt: 'asc',
        },
      }),
      prisma.document.count(),
    ])
    return {
      documents,
      page: pageNo,
      totalPages: Math.ceil(docCount / pageSize),
      totalItems: docCount,
      pageSize,
    }
  },
)
type DocumentsDTO = Awaited<ReturnType<typeof getDocuments>>

const getDocument = withPrisma(async (prisma, id: string) => {
  'use cache'
  cacheLife('max')
  cacheTag(Tag.documents)

  return prisma.document.findUnique({ where: { id } })
})
type DocumentDTO = Awaited<ReturnType<typeof getDocument>>

const getDocumentByCatNo = withPrisma(async (prisma, catNo: string) => {
  'use cache'
  cacheLife('max')
  cacheTag(Tag.documents)

  return prisma.document.findUnique({
    where: {
      catalogueNumber: catNo,
    },
    include: {
      images: true,
      condition: {
        select: {
          name: true,
        },
      },
      relatedBarometers: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  })
})
type DocumentByCatNoDTO = Awaited<ReturnType<typeof getDocumentByCatNo>>

export { getDocuments, getDocument, getAllDocuments, getDocumentByCatNo }
export type { AllDocumentsDTO, DocumentsDTO, DocumentDTO, DocumentByCatNoDTO }
