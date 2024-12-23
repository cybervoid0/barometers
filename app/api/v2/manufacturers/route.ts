import { NextResponse, NextRequest } from 'next/server'
import { withPrisma } from '@/prisma/prismaClient'
import { getManufacturers } from './getters'

/**
 * Retrieve a list of all Manufacturers
 */
export async function GET() {
  try {
    const manufacturers = await getManufacturers()
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
    const manufData = await req.json()

    const newManufacturer = await prisma.manufacturer.create({
      data: manufData,
    })

    return NextResponse.json({ id: newManufacturer.id }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Cannot add new manufacturer' },
      { status: 500 },
    )
  }
})
