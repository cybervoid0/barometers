import { NextResponse, NextRequest } from 'next/server'
import { getPrismaClient } from '@/prisma/prismaClient'

/**
 * Retrieve a list of all Manufacturers
 */
export async function GET() {
  const prisma = getPrismaClient()
  try {
    const manufacturers = await prisma.manufacturer.findMany({
      select: {
        name: true,
        id: true,
      },
      orderBy: {
        name: 'asc',
      },
    })
    return NextResponse.json(manufacturers, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error getting manufacturers' },
      { status: 500 },
    )
  } finally {
    await prisma.$disconnect()
  }
}

//! Protect this function
/**
 * Create a new Manufacturer
 */
export async function POST(req: NextRequest) {
  const prisma = getPrismaClient()
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
  } finally {
    await prisma.$disconnect()
  }
}
