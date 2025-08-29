'use server'

import { type Document, Prisma } from '@prisma/client'
import { withPrisma } from '@/prisma/prismaClient'
import { cleanObject } from '@/utils'

interface DocumentData
  extends Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'date' | 'acquisitionDate'> {
  date?: string | null
  acquisitionDate?: string | null
  relatedBarometers?: string[]
  images?: Array<{
    url: string
    order: number
    name: string
    blurData: string
  }>
}

const createDocument = withPrisma(async (prisma, data: DocumentData) => {
  try {
    const { relatedBarometers, ...documentData } = data
    const { images, ...document } = cleanObject(documentData)
    const result = await prisma.document.create({
      data: {
        ...document,
        images: {
          create: images || [],
        },
        ...(relatedBarometers && Array.isArray(relatedBarometers)
          ? {
              relatedBarometers: {
                connect: relatedBarometers.map((barometerId: string) => ({ id: barometerId })),
              },
            }
          : {}),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
    return { success: true, id: result.id }
  } catch (error) {
    console.error('Error creating document:', error)
    return {
      success: false,
      error:
        error instanceof Prisma.PrismaClientKnownRequestError || error instanceof Error
          ? error.message
          : 'Error adding new document',
    }
  }
})

export { createDocument }
