import { NextResponse } from 'next/server'
import { getPrismaClient } from '@/prisma/prismaClient'

/**
 * Get Categories list
 */
export async function GET() {
  const prisma = getPrismaClient()
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        order: 'asc',
      },
      select: {
        id: true,
        name: true,
        label: true,
        order: true,
      },
    })
    return NextResponse.json(categories, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error getting barometer categories' },
      { status: 500 },
    )
  } finally {
    await prisma.$disconnect()
  }
}
