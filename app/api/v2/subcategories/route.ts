import { NextResponse } from 'next/server'
import { getSubcategories } from './getters'

/**
 * Get Subcategories list
 */
export async function GET() {
  try {
    const subcategories = await getSubcategories()
    return NextResponse.json(subcategories, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'Error getting barometer subcategories',
      },
      { status: 500 },
    )
  }
}
