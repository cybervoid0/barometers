import { NextResponse, NextRequest } from 'next/server'
import { connectMongoose } from '@/utils/mongoose'
import Manufacturer, { type IManufacturer } from '@/models/manufacturer'
import { cleanObject } from '@/utils/misc'

export async function GET() {
  await connectMongoose()
  try {
    const conditions = await Manufacturer.find()
    return NextResponse.json(conditions, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error getting manufacturers' },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  await connectMongoose()
  try {
    const manufData: IManufacturer = await req.json()
    const cleanData = cleanObject(manufData)
    const newManufacturer = new Manufacturer(cleanData)
    await newManufacturer.save()
    return NextResponse.json({ id: newManufacturer._id }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Cannot add new manufacturer',
      },
      { status: 500 },
    )
  }
}
