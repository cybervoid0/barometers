import { NextResponse } from 'next/server'
import { getPrismaClient } from '@/prisma/prismaClient'
import { getCategories } from './getters'

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
