import { NextResponse, NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getPrismaClient } from '@/prisma/prismaClient'

interface Parameters {
  params: {
    id: string
  }
}

async function getManufacturer(prisma: PrismaClient, id: string) {
  return prisma.manufacturer.findUnique({
    where: {
      id,
    },
  })
}
export type ManufacturerDTO = Awaited<ReturnType<typeof getManufacturer>>

/**
 * Query a specific manufacturer by ID
 */
export async function GET(req: NextRequest, { params: { id } }: Parameters) {
  const prisma = getPrismaClient()
  try {
    const manufacturer = await getManufacturer(prisma, id)
    return NextResponse.json(manufacturer, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error querying manufacturer' },
      { status: 500 },
    )
  } finally {
    await prisma.$disconnect()
  }
}

// !нужно как-то защитить от общего доступа к этой функции

/**
 * Delete manufacturer by ID
 */
export async function DELETE(req: NextRequest, { params: { id } }: Parameters) {
  const prisma = getPrismaClient()
  try {
    const manufacturer = await prisma.manufacturer.findUnique({ where: { id } })
    if (!manufacturer) {
      return NextResponse.json({ message: 'Manufacturer not found' }, { status: 404 })
    }
    await prisma.manufacturer.delete({
      where: {
        id,
      },
    })
    return NextResponse.json({ message: 'Manufacturer deleted successfully' }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Cannot delete manufacturer',
      },
      { status: 500 },
    )
  } finally {
    await prisma.$disconnect()
  }
}
