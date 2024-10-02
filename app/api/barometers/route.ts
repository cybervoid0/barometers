import { NextRequest, NextResponse } from 'next/server'
import { connectMongoose } from '@/utils/mongoose'
import Barometer, { IBarometer } from '@/models/barometer'
import '@/models/type'
import '@/models/condition'
import '@/models/manufacturer'
import { cleanObject } from '@/utils/misc'

export async function GET() {
  await connectMongoose()
  try {
    const barometers = await Barometer.find().populate(['type', 'condition', 'manufacturer'])
    return NextResponse.json(barometers, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Could not retrieve barometer list' },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  await connectMongoose()
  try {
    const barometerData: IBarometer = await req.json()
    const cleanData = cleanObject(barometerData)
    const newBarometer = new Barometer(cleanData)
    await newBarometer.save()
    return NextResponse.json({ id: newBarometer._id }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error adding new barometer' },
      { status: 500 },
    )
  }
}
