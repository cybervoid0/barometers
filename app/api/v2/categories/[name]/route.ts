import { NextRequest, NextResponse } from 'next/server'
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
  try {
    const category = await getCategory(name)
    return NextResponse.json(category, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error retrieving category details' },
      { status: 500 },
    )
  }
}
