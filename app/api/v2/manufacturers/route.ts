import { NextResponse, NextRequest } from 'next/server'
import { Manufacturer } from '@prisma/client'
import { withPrisma } from '@/prisma/prismaClient'
import { getManufacturers } from './getters'
import { slug } from '@/utils/misc'
import { DEFAULT_PAGE_SIZE } from '../parameters'

/**
 * Retrieve a list of all Manufacturers
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const size = Math.max(Number(searchParams.get('size') ?? DEFAULT_PAGE_SIZE), 0)
    const page = Math.max(Number(searchParams.get('page') || 1), 1)
    const manufacturers = await getManufacturers(page, size)
    return NextResponse.json(manufacturers, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error getting manufacturers' },
      { status: 500 },
    )
  }
}

//! Protect this function
/**
 * Create a new Manufacturer
 */
export const POST = withPrisma(async (prisma, req: NextRequest) => {
  try {
    const manufData: Manufacturer = await req.json()

    const newManufacturer = await prisma.manufacturer.create({
      data: {
        ...manufData,
        slug: slug(manufData.name),
      },
    })

    return NextResponse.json({ id: newManufacturer.id }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Cannot add new manufacturer' },
      { status: 500 },
    )
  }
})
