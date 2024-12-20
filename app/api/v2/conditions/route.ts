import { NextResponse } from 'next/server'
import { getPrismaClient } from '@/prisma/prismaClient'
import { getConditions } from './getters'

/**
 * Get list of possible barometer Conditions
 */
export async function GET() {
  const prisma = getPrismaClient()
  try {
    const conditions = await getConditions(prisma)
    return NextResponse.json(conditions, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error getting barometer conditions' },
      { status: 500 },
    )
  } finally {
    await prisma.$disconnect()
  }
}
