import { NextRequest, NextResponse } from 'next/server'
import { getInaccuracyReport } from '../getters'

interface Params {
  params: {
    id: string
  }
}

export async function GET(req: NextRequest, { params: { id } }: Params) {
  try {
    const report = await getInaccuracyReport(id)
    return NextResponse.json(report, { status: 200 })
  } catch (error) {
    console.error('Error fetching inaccuracy report:', error)
    const message = error instanceof Error ? error.message : 'Could not get inaccuracy report'
    return NextResponse.json({ message }, { status: 500 })
  }
}
