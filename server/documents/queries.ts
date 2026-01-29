import 'server-only'

import { cacheLife, cacheTag } from 'next/cache'
import { DEFAULT_PAGE_SIZE, Tag } from '@/constants'
import { prisma } from '@/prisma/prismaClient'

export async function getAllDocuments() {
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
}
export type AllDocumentsDTO = Awaited<ReturnType<typeof getAllDocuments>>

export async function getDocuments(pageNo: number = 1, pageSize: number = DEFAULT_PAGE_SIZE) {
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
}
export type DocumentsDTO = Awaited<ReturnType<typeof getDocuments>>

export async function getDocument(id: string) {
  'use cache'
  cacheLife('max')
  cacheTag(Tag.documents)

  return prisma.document.findUnique({ where: { id } })
}
export type DocumentDTO = Awaited<ReturnType<typeof getDocument>>

export async function getDocumentByCatNo(catNo: string) {
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
}
export type DocumentByCatNoDTO = Awaited<ReturnType<typeof getDocumentByCatNo>>
