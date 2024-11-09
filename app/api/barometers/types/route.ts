import { NextRequest, NextResponse } from 'next/server'
import { connectMongoose } from '@/utils/mongoose'
import BarometerType from '@/models/type'

export async function GET(request: NextRequest) {
  try {
    await connectMongoose()
    const { searchParams } = request.nextUrl
    const type = searchParams.get('type')
    if (type) {
      const typeDetails = await BarometerType.findOne({ name: { $regex: type, $options: 'i' } })
      return NextResponse.json(typeDetails, { status: 201 })
    }
    const types = await BarometerType.find().sort({ order: 1 })
    return NextResponse.json(types, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error getting barometer types' },
      { status: 500 },
    )
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function PUT(req: NextRequest) {
  try {
    await connectMongoose()

    return NextResponse.json({}, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error updating barometer' },
      { status: 500 },
    )
  }
}
