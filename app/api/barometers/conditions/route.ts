import { NextResponse } from 'next/server'
import { connectMongoose } from '@/utils/mongoose'
import BarometerCondition from '@/models/condition'

export async function GET() {
  await connectMongoose()

  try {
    const conditions = await BarometerCondition.find()
    return NextResponse.json(conditions, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error getting barometer conditions' },
      { status: 500 },
    )
  }
}
