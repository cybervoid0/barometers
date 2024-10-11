import { NextRequest, NextResponse } from 'next/server'
import { connectMongoose } from '@/utils/mongoose'
import Barometer from '@/models/barometer'
import '@/models/type'
import '@/models/condition'
import '@/models/manufacturer'

interface Params {
  params: {
    slug: string
  }
}

export async function GET(_req: NextRequest, { params: { slug } }: Params) {
  await connectMongoose()

  try {
    const barometers = await Barometer.findOne({ slug }).populate([
      'type',
      'condition',
      'manufacturer',
    ])
    if (barometers === null) return NextResponse.json({}, { status: 404 })
    return NextResponse.json(barometers, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error adding conditions' },
      { status: 500 },
    )
  }
}
