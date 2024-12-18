import { NextRequest, NextResponse } from 'next/server'
import { type PrismaClient } from '@prisma/client'
import { getPrismaClient } from '@/prisma/prismaClient'
import { DEFAULT_PAGE_SIZE } from '../parameters'

/**
 * Search barometers matching a query
 */
async function searchBarometers(
  prisma: PrismaClient,
  query: string,
  page: number,
  pageSize: number,
) {
  const skip = (page - 1) * pageSize

  const [barometers, totalItems] = await Promise.all([
    prisma.barometer.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        dateDescription: true,
        slug: true,
        manufacturer: {
          select: {
            name: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
        images: {
          orderBy: {
            order: 'asc',
          },
          take: 1,
          select: {
            url: true,
          },
        },
      },
      skip,
      take: pageSize,
    }),
    prisma.barometer.count({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
    }),
  ])

  // replace array of images with the first image
  const barometersWithFirstImage = barometers.map(barometer => {
    const { images, ...restBarometer } = barometer
    return {
      ...restBarometer,
      image: images.at(0),
    }
  })

  return {
    barometers: barometersWithFirstImage,
    totalItems,
    page,
    totalPages: Math.ceil(totalItems / pageSize),
    pageSize,
  }
}
export type SearchResultsDTO = Awaited<ReturnType<typeof searchBarometers>>

export async function GET(req: NextRequest) {
  const prisma = getPrismaClient()
  try {
    const { searchParams } = req.nextUrl
    const query = searchParams.get('q')
    const pageSize = Math.max(Number(searchParams.get('size')) || DEFAULT_PAGE_SIZE, 1)
    const page = Math.max(Number(searchParams.get('page')) || 1, 1)

    if (!query) {
      return NextResponse.json([], { status: 200 })
    }

    const barometers = await searchBarometers(prisma, query, page, pageSize)
    return NextResponse.json(barometers, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error searching barometers' },
      { status: 500 },
    )
  } finally {
    await prisma.$disconnect()
  }
}
