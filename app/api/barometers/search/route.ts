import { NextRequest, NextResponse } from 'next/server'
import Barometer from '@/models/barometer'
import { DEFAULT_PAGE_SIZE, type PaginationDTO } from '../../types'
import { connectMongoose } from '@/utils/mongoose'

// dependencies to include in resulting barometers array
export const deps = ['type', 'condition', 'manufacturer']

/**
 * Search barometers matching a query
 */
async function searchBarometers(query: string, page: number, pageSize: number) {
  const quotedQuery = `"${query.trim()}"`
  const skip = (page - 1) * pageSize
  const [barometers, totalItems] = await Promise.all([
    Barometer.find({ $text: { $search: quotedQuery } })
      .populate(deps)
      .skip(skip)
      .limit(pageSize),
    Barometer.countDocuments({ $text: { $search: quotedQuery } }),
  ])
  return NextResponse.json<PaginationDTO>(
    {
      barometers,
      totalItems,
      page,
      totalPages: Math.ceil(totalItems / pageSize),
      pageSize,
    },
    { status: 200 },
  )
}

export async function GET(req: NextRequest) {
  try {
    await connectMongoose()
    const { searchParams } = req.nextUrl
    const query = searchParams.get('q')
    const pageSize = Math.max(Number(searchParams.get('pageSize')) || DEFAULT_PAGE_SIZE, 1)
    const page = Math.max(Number(searchParams.get('page')) || 1, 1)
    if (!query)
      return NextResponse.json<PaginationDTO>(
        {
          barometers: [],
          page: 0,
          pageSize,
          totalItems: 0,
          totalPages: 0,
        },
        { status: 200 },
      )
    return await searchBarometers(query, page, pageSize)
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Could not execute the query' },
      { status: 500 },
    )
  }
}
