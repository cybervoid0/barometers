import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { withPrisma } from '@/prisma/prismaClient'
import { cleanObject } from '@/utils'
import { DEFAULT_PAGE_SIZE } from '../parameters'

/**
 * Get document list
 *
 * GET /api/documents
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const size = Math.max(Number(searchParams.get('size') ?? DEFAULT_PAGE_SIZE), 0)
    const page = Math.max(Number(searchParams.get('page') || 1), 1)

    const documents = await withPrisma(async prisma => {
      const [data, total] = await Promise.all([
        prisma.document.findMany({
          skip: (page - 1) * size,
          take: size,
          include: {
            condition: true,
            images: true,
            relatedBarometers: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
        prisma.document.count(),
      ])

      return {
        documents: data,
        pagination: {
          page,
          size,
          total,
          totalPages: Math.ceil(total / size),
        },
      }
    })()

    return NextResponse.json(documents, { status: documents.documents.length > 0 ? 200 : 404 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Could not retrieve document list' },
      { status: 500 },
    )
  }
}

//! Protect this function
/**
 * Add new document
 *
 * POST /api/documents
 */
export const POST = withPrisma(async (prisma, req: NextRequest) => {
  try {
    const { relatedBarometers, ...documentData } = await req.json()
    const { images, ...document } = cleanObject(documentData)

    const { id } = await prisma.document.create({
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

    return NextResponse.json({ id }, { status: 201 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error adding new document' },
      { status: 500 },
    )
  }
})

//! Protect this function
/**
 * Update document data
 *
 * PUT /api/documents
 */
export const PUT = withPrisma(async (prisma, req: NextRequest) => {
  try {
    const { relatedBarometers, ...documentData } = await req.json()
    const { images, id, ...document } = cleanObject(documentData)

    // transaction will prevent deleting images in case document update fails
    await prisma.$transaction(async tx => {
      await Promise.all([
        // delete old images if the new ones are provided
        images
          ? tx.image.deleteMany({ where: { documents: { some: { id } } } })
          : Promise.resolve(),
        tx.document.update({
          where: { id },
          data: {
            ...document,
            // attach new images if provided
            ...(images
              ? {
                  images: {
                    create: images,
                  },
                }
              : {}),
            ...(relatedBarometers && Array.isArray(relatedBarometers)
              ? {
                  relatedBarometers: {
                    // `set` replaces all previously connected barometers
                    set: relatedBarometers.map((barometerId: string) => ({ id: barometerId })),
                  },
                }
              : {}),
            updatedAt: new Date(),
          },
        }),
      ])
    })

    return NextResponse.json({ id }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : '/api/v2/documents PUT: Error updating document',
      },
      { status: 500 },
    )
  }
})
