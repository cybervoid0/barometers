import { NextRequest, NextResponse } from 'next/server'
import { getPrismaClient } from '@/prisma/prismaClient'

interface Params {
  params: {
    slug: string
  }
}

/**
 * Get Barometer details by slug
 */
export async function GET(_req: NextRequest, { params: { slug } }: Params) {
  const prisma = getPrismaClient()
  try {
    const barometer = await prisma.barometer.findFirst({
      where: {
        slug: {
          equals: slug,
          mode: 'insensitive',
        },
      },
      include: {
        category: true,
        condition: true,
        manufacturer: true,
      },
    })
    if (barometer === null) return NextResponse.json({}, { status: 404 })
    return NextResponse.json(barometer, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error retrieving barometer' },
      { status: 500 },
    )
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Delete Barometer by slug
 */
export async function DELETE(_req: NextRequest, { params: { slug } }: Params) {
  const prisma = getPrismaClient()
  try {
    const barometer = await prisma.barometer.findFirst({
      where: {
        slug: {
          equals: slug,
          mode: 'insensitive',
        },
      },
    })

    if (!barometer) {
      return NextResponse.json({ message: 'Barometer not found' }, { status: 404 })
    }

    await prisma.barometer.delete({
      where: {
        id: barometer.id,
      },
    })

    return NextResponse.json({ message: 'Barometer deleted successfully' }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Error deleting barometer',
      },
      { status: 500 },
    )
  } finally {
    await prisma.$disconnect()
  }
}
