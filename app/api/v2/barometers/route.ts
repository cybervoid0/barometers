import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import type { Barometer } from '@prisma/client'
import { getPrismaClient } from '@/prisma/prismaClient'
import { cleanObject, slug as slugify } from '@/utils/misc'
import { type SortValue } from '@/app/collection/categories/[category]/types'
import { DEFAULT_PAGE_SIZE } from '../parameters'
import { getAllBarometers, getBarometersByParams } from './getters'

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
