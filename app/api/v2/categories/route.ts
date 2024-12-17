import { NextResponse } from 'next/server'
import { type PrismaClient } from '@prisma/client'
import { getPrismaClient } from '@/prisma/prismaClient'

async function getCategories(prisma: PrismaClient) {
  return prisma.category.findMany({
    orderBy: {
      order: 'asc',
    },
    select: {
      id: true,
      name: true,
      label: true,
      order: true,
      image: {
        select: {
          url: true,
        },
      },
    },
  })
}

export type CategoryListDTO = Awaited<ReturnType<typeof getCategories>>

/**
 * Get Categories list
 */
export async function GET() {
  const prisma = getPrismaClient()
  try {
    const categories = await getCategories(prisma)
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
