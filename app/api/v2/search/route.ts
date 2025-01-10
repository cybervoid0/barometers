import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_PAGE_SIZE } from '../parameters'
import { searchBarometers } from './search'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const query = searchParams.get('q')
    const pageSize = Math.max(Number(searchParams.get('size') ?? DEFAULT_PAGE_SIZE), 0)
    const page = Math.max(Number(searchParams.get('page') || 1), 1)

    if (!query) {
      return NextResponse.json([], { status: 200 })
    }

    const barometers = await searchBarometers(query, page, pageSize)
    return NextResponse.json(barometers, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error searching barometers' },
      { status: 500 },
    )
  }
}
