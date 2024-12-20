import { NextRequest, NextResponse } from 'next/server'
import { getPrismaClient } from '@/prisma/prismaClient'
import { getCategory } from './getters'

interface Params {
  params: {
    name: string
  }
}

/**
 * Get Category details
 */
export async function GET(_req: NextRequest, { params: { name } }: Params) {
  const prisma = getPrismaClient()
  try {
    const category = await getCategory(prisma, name)
    return NextResponse.json(category, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error retrieving category details' },
      { status: 500 },
    )
  } finally {
    await prisma.$disconnect()
  }
}
