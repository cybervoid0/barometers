import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import type { Barometer, Prisma, PrismaClient } from '@prisma/client'
import { getPrismaClient } from '@/prisma/prismaClient'
import { cleanObject, slug as slugify } from '@/utils/misc'
import { type SortValue } from '@/app/collection/categories/[category]/types'
import { DEFAULT_PAGE_SIZE } from '../parameters'

function getSortCriteria(
  sortBy: SortValue | null,
  direction: 'asc' | 'desc' = 'asc',
): Prisma.BarometerOrderByWithRelationInput {
  switch (sortBy) {
    case 'manufacturer':
      return { manufacturer: { name: direction } }
    case 'name':
      return { name: direction }
    case 'date':
      return { date: direction }
    case 'cat-no':
      return { collectionId: direction }
    default:
      return { date: direction }
  }
}

/**
 * Find a list of barometers of a certain category (and other params)
 * Respond with pagination
 */
async function getBarometersByParams(
  prisma: PrismaClient,
  categoryName: string,
  page: number,
  pageSize: number,
  sortBy: SortValue | null,
) {
  // perform case-insensitive compare with the stored categories
  const category = await prisma.category.findFirst({
    where: { name: { equals: categoryName, mode: 'insensitive' } },
  })
  if (!category) throw new Error('Unknown barometer category')

  const skip = (page - 1) * pageSize
  const orderBy = getSortCriteria(sortBy)

  const [barometers, totalItems] = await Promise.all([
    prisma.barometer.findMany({
      where: { categoryId: category.id },
      select: {
        id: true,
        name: true,
        date: true,
        slug: true,
        collectionId: true,
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
          select: {
            url: true,
            order: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
      skip,
      take: pageSize,
      orderBy,
    }),
    prisma.barometer.count({ where: { categoryId: category.id } }),
  ])

  return {
    barometers,
    page,
    totalItems,
    pageSize,
    totalPages: Math.ceil(totalItems / pageSize),
  }
}

export type ParameterizedBarometerListDTO = Awaited<ReturnType<typeof getBarometersByParams>>

/**
 * List all barometers WITHOUT pagination. This is used in static pages generation
 */
async function getAllBarometers(prisma: PrismaClient) {
  return prisma.barometer.findMany({
    select: {
      id: true,
      name: true,
      date: true,
      slug: true,
      collectionId: true,
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
    },
  })
}

export type BarometerListDTO = Awaited<ReturnType<typeof getAllBarometers>>

/**
 * Get barometer list
 *
 * GET /api/barometers?category=aneroid
 */
export async function GET(req: NextRequest) {
  const prisma = getPrismaClient()
  try {
    const { searchParams } = req.nextUrl
    const category = searchParams.get('category')
    const sortBy = searchParams.get('sort') as SortValue | null
    const size = Math.max(Number(searchParams.get('size')) || DEFAULT_PAGE_SIZE, 1)
    const page = Math.max(Number(searchParams.get('page')) || 1, 1)
    // if `type` search param was not passed return all barometers list
    if (!category || !category.trim()) {
      const barometers = await getAllBarometers(prisma)
      return NextResponse.json(barometers, { status: 200 })
    }
    // type was passed
    const dbResponse = await getBarometersByParams(prisma, category, page, size, sortBy)
    return NextResponse.json(dbResponse, { status: dbResponse.barometers.length > 0 ? 200 : 404 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Could not retrieve barometer list' },
      { status: 500 },
    )
  } finally {
    await prisma.$disconnect()
  }
}

//! Protect this function
/**
 * Add new barometer
 *
 * POST /api/barometers
 */
export async function POST(req: NextRequest) {
  const prisma = getPrismaClient()
  try {
    const barometerData: Barometer = await req.json()
    const cleanData = cleanObject(barometerData)
    const slug = slugify(cleanData.name)
    const newBarometer = await prisma.barometer.create({
      data: {
        ...cleanData,
        slug,
        dimensions: cleanData.dimensions?.toString(),
      },
    })
    revalidatePath('/')
    return NextResponse.json({ id: newBarometer.id }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error adding new barometer' },
      { status: 500 },
    )
  } finally {
    await prisma.$disconnect()
  }
}
//! Protect this function
/**
 * Update barometer data
 *
 * PUT /api/barometers
 */
export async function PUT(req: NextRequest) {
  const prisma = getPrismaClient()
  try {
    const barometerData: Barometer = await req.json()
    const slug = slugify(barometerData.name)
    await prisma.barometer.update({
      where: { id: barometerData.id },
      data: {
        ...barometerData,
        slug,
        dimensions: barometerData.dimensions?.toString(),
      },
    })
    revalidatePath(`/collection/items/${slug}`)
    return NextResponse.json({ slug }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error updating barometer' },
      { status: 500 },
    )
  } finally {
    await prisma.$disconnect()
  }
}
