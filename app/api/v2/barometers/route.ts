import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { Prisma, PrismaClient } from '@prisma/client'
import { withPrisma } from '@/prisma/prismaClient'
import { cleanObject, slug as slugify } from '@/utils/misc'
import { SortValue, SortOptions } from '@/app/types'
import { DEFAULT_PAGE_SIZE } from '../parameters'
import { getAllBarometers, getBarometersByParams } from './getters'
import { barometerRoute, categoriesRoute, BAROMETERS_PER_CATEGORY_PAGE } from '@/app/constants'

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
    const size = Math.max(Number(searchParams.get('size')) || DEFAULT_PAGE_SIZE, 1)
    const page = Math.max(Number(searchParams.get('page')) || 1, 1)
    // if `type` search param was not passed return all barometers list
    if (!category || !category.trim()) {
      const barometers = await getAllBarometers()
      return NextResponse.json(barometers, { status: 200 })
    }
    // type was passed
    const dbResponse = await getBarometersByParams(category, page, size, sortBy)
    return NextResponse.json(dbResponse, { status: dbResponse.barometers.length > 0 ? 200 : 404 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Could not retrieve barometer list' },
      { status: 500 },
    )
  }
}

/**
 * Revalidates the cache for a specific category by recalculating the paths that need to be revalidated.
 * Call this function after adding/updating a barometer to update the category pages that include the
 * barometer.
 *
 * @param prisma - The PrismaClient instance used to interact with the database.
 * @param categoryId - The ID of the category to revalidate.
 */
async function revalidateCategory(prisma: PrismaClient, categoryId: string) {
  const { name: categoryName } = await prisma.category.findUniqueOrThrow({
    where: { id: categoryId },
    select: { name: true },
  })
  const barometersInCategory = await prisma.barometer.count({ where: { categoryId } })
  const pagesPerCategory = Math.ceil(barometersInCategory / BAROMETERS_PER_CATEGORY_PAGE)
  const pathsToRevalidate = SortOptions.flatMap(({ value: sort }) =>
    Array.from(
      { length: pagesPerCategory },
      (_, i) => `${categoriesRoute}${[categoryName, sort, String(i + 1)].join('/')}`,
    ),
  )
  await Promise.all(pathsToRevalidate.map(path => revalidatePath(path)))
}

//! Protect this function
/**
 * Add new barometer
 *
 * POST /api/barometers
 */
export const POST = withPrisma(async (prisma, req: NextRequest) => {
  try {
    const barometerData = await req.json()
    const { images, ...barometer } = cleanObject(barometerData)
    const { id, categoryId } = await prisma.barometer.create({
      data: {
        ...barometer,
        images: {
          create: images,
        },
      },
    })
    await revalidateCategory(prisma, categoryId)
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
    const barometerData = await req.json()
    const { images, id, ...barometer } = cleanObject(barometerData)
    const { slug } = await prisma.barometer.findUniqueOrThrow({ where: { id } })
    // modify slug if name has changed
    const newData = { ...barometer, slug: barometer.name ? slugify(barometer.name) : slug }
    // transaction will prevent deleting images in case barometer update fails
    await prisma.$transaction(async tx => {
      if (images && images.length > 0) {
        // delete old images
        await tx.image.deleteMany({ where: { barometers: { some: { id } } } })
        await tx.barometer.update({
          where: { id },
          data: {
            ...newData,
            // attach new images
            images: {
              create: images,
            },
          },
        })
      } else {
        // images are not updated
        await tx.barometer.update({
          where: { id },
          data: newData,
        })
      }
    })
    revalidatePath(barometerRoute + newData.slug)
    await revalidateCategory(prisma, newData.categoryId)
    return NextResponse.json({ slug: newData.slug }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error updating barometer' },
      { status: 500 },
    )
  }
})
