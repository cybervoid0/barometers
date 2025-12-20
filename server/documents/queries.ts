import 'server-only'

import { unstable_cache as cache } from 'next/cache'
import { DEFAULT_PAGE_SIZE, Tag } from '@/constants'
import { withPrisma } from '@/prisma/prismaClient'

const getAllDocuments = cache(
  withPrisma(prisma =>
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
        relatedBarometers: {
          select: {
            id: true,
          },
        },
      },
    }),
  ),
  ['getAllDocuments'],
  { tags: [Tag.documents] },
)
type AllDocumentsDTO = Awaited<ReturnType<typeof getAllDocuments>>

const getDocuments = cache(
  withPrisma(async (prisma, pageNo: number = 1, pageSize: number = DEFAULT_PAGE_SIZE) => {
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
  }),
  ['getDocuments'],
  { tags: [Tag.documents] },
)
type DocumentsDTO = Awaited<ReturnType<typeof getDocuments>>

const getDocument = cache(
  withPrisma(async (prisma, id: string) => {
    return prisma.document.findUnique({ where: { id } })
  }),
  ['getDocument'],
  { tags: [Tag.documents] },
)
type DocumentDTO = Awaited<ReturnType<typeof getDocument>>

const getDocumentByCatNo = cache(
  withPrisma((prisma, catNo: string) =>
    prisma.document.findUnique({
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
    }),
  ),
  ['getDocumentByCatNo'],
  { tags: [Tag.documents] },
)
type DocumentByCatNoDTO = Awaited<ReturnType<typeof getDocumentByCatNo>>

export { getDocuments, getDocument, getAllDocuments, getDocumentByCatNo }
export type { AllDocumentsDTO, DocumentsDTO, DocumentDTO, DocumentByCatNoDTO }
