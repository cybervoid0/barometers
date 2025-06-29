import { NextResponse } from 'next/server'
import { getCategories } from './getters'

/**
 * Get Categories list
 */
export async function GET() {
  try {
    const categories = await getCategories()
    return NextResponse.json(categories, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'Error getting barometer categories',
      },
      { status: 500 },
    )
  }
}
