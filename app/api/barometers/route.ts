import { NextRequest, NextResponse } from 'next/server'
import { connectMongoose } from '@/utils/mongoose'
import Barometer, { IBarometer } from '@/models/barometer'
import BarometerType from '@/models/type'
import '@/models/condition'
import '@/models/manufacturer'
import { cleanObject } from '@/utils/misc'

export async function GET(req: NextRequest) {
  await connectMongoose()
  try {
    const { searchParams } = new URL(req.url)
    const typeName = searchParams.get('type')
    // if `type` search param was not passed return all barometers list
    if (!typeName || !typeName.trim()) {
      const barometers = await Barometer.find().populate(['type', 'condition', 'manufacturer'])
      return NextResponse.json(barometers, { status: 200 })
    }
    // if some non-empty `type` was passed, perform case-insensitive compare with the stored types
    const barometerType = await BarometerType.findOne({
      name: { $regex: new RegExp(`^${typeName}$`, 'i') },
    })
    if (!barometerType) return NextResponse.json([], { status: 404 })

    // if existing barometer type match the `type` param, return all corresponding barometers
    const barometers = await Barometer.find({ type: barometerType._id }).populate([
      'type',
      'condition',
      'manufacturer',
    ])
    return NextResponse.json(barometers, { status: barometers.length > 0 ? 200 : 404 })
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
