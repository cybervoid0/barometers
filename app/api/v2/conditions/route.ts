import { NextResponse } from 'next/server'
import { getConditions } from './getters'

/**
 * Get list of possible barometer Conditions
 */
export async function GET() {
  try {
    const conditions = await getConditions()
    return NextResponse.json(conditions, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error getting barometer conditions' },
      { status: 500 },
    )
  }
}
