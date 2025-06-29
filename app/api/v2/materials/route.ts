import { NextResponse } from 'next/server'
import { getMaterials } from './getters'

/**
 * Get Materials list
 */
export async function GET() {
  try {
    const materials = await getMaterials()
    return NextResponse.json(materials, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'Error getting barometer materials',
      },
      { status: 500 },
    )
  }
}
