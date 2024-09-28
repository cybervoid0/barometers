import { NextResponse } from 'next/server'
import { connectMongoose } from '@/utils/mongoose'
import BarometerType from '@/models/type'

export async function GET() {
  await connectMongoose()

  try {
    const types = await BarometerType.find()
    return NextResponse.json(types, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error getting barometer types' },
      { status: 500 },
    )
  }
}
