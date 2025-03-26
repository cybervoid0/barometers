import { NextResponse } from 'next/server'
import { getCountries } from './getters'

/**
 * Get Country list
 */
export async function GET() {
  try {
    const countries = await getCountries()
    return NextResponse.json(countries, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error getting country list' },
      { status: 500 },
    )
  }
}
