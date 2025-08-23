import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'
import { withPrisma } from '@/prisma/prismaClient'
import { cleanObject, slug as slugify, trimTrailingSlash } from '@/utils'
import { SortValue } from '@/types'
import { DEFAULT_PAGE_SIZE } from '../parameters'
import { getBarometersByParams } from './getters'
import { FrontRoutes } from '@/constants/routes-front'
import { revalidateCategory } from './revalidate'

/**
 * Get barometer list
 *
 * GET /api/barometers?category=aneroid
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const category = searchParams.get('category')
    const sortBy = searchParams.get('sort') as SortValue | null
    const size = Math.max(Number(searchParams.get('size') ?? DEFAULT_PAGE_SIZE), 0)
    const page = Math.max(Number(searchParams.get('page') || 1), 1)
    const dbResponse = await getBarometersByParams(category, page, size, sortBy)
    return NextResponse.json(dbResponse, { status: dbResponse.barometers.length > 0 ? 200 : 404 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Could not retrieve barometer list' },
      { status: 500 },
    )
  }
}

//! Protect this function
/**
 * Add new barometer
 *
 * POST /api/barometers
 */
export const POST = withPrisma(async (prisma, req: NextRequest) => {
  try {
    // extracting materials before cleaning object to keep empty array
    const { materials, ...barometerData } = await req.json()
    const { images, ...barometer } = cleanObject(barometerData)
    const { id, categoryId } = await prisma.barometer.create({
      data: {
        ...barometer,
        images: {
          create: images,
        },
        ...(materials && Array.isArray(materials)
          ? {
              materials: {
                connect: materials.map((materialId: number) => ({ id: materialId })),
              },
            }
          : {}),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
    await revalidateCategory(prisma, categoryId)
    revalidatePath(trimTrailingSlash(FrontRoutes.NewArrivals)) // regenerate new arrivals page
    return NextResponse.json({ id }, { status: 201 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error adding new barometer' },
      { status: 500 },
    )
  }
})

//! Protect this function
/**
 * Update barometer data
 *
 * PUT /api/barometers
 */
export const PUT = withPrisma(async (prisma, req: NextRequest) => {
  try {
    // extracting materials before cleaning object to keep empty array
    const { materials, ...barometerData } = await req.json()
    const { images, id, ...barometer } = cleanObject(barometerData)
    const { slug, categoryId } = await prisma.barometer.findUniqueOrThrow({ where: { id } })
    // modify slug if name has changed
    const newData = { ...barometer, slug: barometer.name ? slugify(barometer.name) : slug }
    // transaction will prevent deleting images in case barometer update fails
    await prisma.$transaction(async tx => {
      await Promise.all([
        // delete old images if the new ones are provided
        images
          ? tx.image.deleteMany({ where: { barometers: { some: { id } } } })
          : Promise.resolve(),
        tx.barometer.update({
          where: { id },
          data: {
            ...newData,
            // attach new images if provided
            ...(images
              ? {
                  images: {
                    create: images,
                  },
                }
              : {}),
            ...(materials && Array.isArray(materials)
              ? {
                  materials: {
                    // `set` replaces all previously connected materials
                    set: materials.map((materialId: number) => ({ id: materialId })),
                  },
                }
              : {}),
            updatedAt: new Date(),
          },
        }),
      ])
    })
    revalidatePath(FrontRoutes.Barometer + newData.slug)
    await revalidateCategory(prisma, newData.categoryId ?? categoryId)
    return NextResponse.json({ slug: newData.slug }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : '/api/v2/barometer PUT: Error updating barometer',
      },
      { status: 500 },
    )
  }
})
