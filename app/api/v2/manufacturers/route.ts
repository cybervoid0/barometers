import { NextResponse, NextRequest } from 'next/server'
import { type PrismaClient } from '@prisma/client'
import { getPrismaClient } from '@/prisma/prismaClient'

async function getManufacturers(prisma: PrismaClient) {
  return prisma.manufacturer.findMany({
    select: {
      name: true,
      id: true,
    },
    orderBy: {
      name: 'asc',
    },
  })
}
export type ManufacturerListDTO = Awaited<ReturnType<typeof getManufacturers>>

/**
 * Retrieve a list of all Manufacturers
 */
export async function GET() {
  const prisma = getPrismaClient()
  try {
    const manufacturers = await getManufacturers(prisma)
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
