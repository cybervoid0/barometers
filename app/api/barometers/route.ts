import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { connectMongoose } from '@/utils/mongoose'
import Barometer, { IBarometer } from '@/models/barometer'
import BarometerType from '@/models/type'
import '@/models/condition'
import Manufacturer from '@/models/manufacturer'
import { cleanObject, slug as slugify } from '@/utils/misc'

/**
 * Get barometer list
 *
 * GET /api/barometers?type=type
 */
export async function GET(req: NextRequest) {
  await connectMongoose()
  try {
    const { searchParams } = new URL(req.url)
    const typeName = searchParams.get('type')
    // if `type` search param was not passed return all barometers list
    if (!typeName || !typeName.trim()) {
      const barometers = (
        await Barometer.find().populate(['type', 'condition', 'manufacturer'])
      ).toSorted((a, b) => (a.manufacturer?.name ?? '').localeCompare(b.manufacturer?.name ?? ''))
      return NextResponse.json(barometers, { status: 200 })
    }
    // if some non-empty `type` was passed, perform case-insensitive compare with the stored types
    const barometerType = await BarometerType.findOne({
      name: { $regex: new RegExp(`^${typeName}$`, 'i') },
    })
    if (!barometerType) return NextResponse.json([], { status: 404 })

    // if existing barometer type match the `type` param, return all corresponding barometers
    const barometers = (
      await Barometer.find({ type: barometerType._id }).populate([
        'type',
        'condition',
        'manufacturer',
      ])
    ).toSorted((a, b) => (a.manufacturer?.name ?? '').localeCompare(b.manufacturer?.name ?? ''))
    return NextResponse.json(barometers, { status: barometers.length > 0 ? 200 : 404 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Could not retrieve barometer list' },
      { status: 500 },
    )
  }
}

/**
 * Add new barometer
 *
 * POST /api/barometers
 */
export async function POST(req: NextRequest) {
  await connectMongoose()
  try {
    const barometerData: IBarometer = await req.json()
    const cleanData = cleanObject(barometerData)
    const slug = slugify(cleanData.name)
    cleanData.slug = slug
    const newBarometer = new Barometer(cleanData)
    await newBarometer.save()
    revalidatePath(`/collection/items/${slug}`)
    return NextResponse.json({ id: newBarometer._id }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error adding new barometer' },
      { status: 500 },
    )
  }
}

/**
 * Update barometer data
 *
 * PUT /api/barometers
 */
export async function PUT(req: NextRequest) {
  await connectMongoose()
  try {
    const barometerData: IBarometer = await req.json()
    const slug = slugify(barometerData.name)
    barometerData.slug = slug
    await Manufacturer.findByIdAndUpdate(
      barometerData.manufacturer?._id,
      barometerData.manufacturer,
    )
    const updatedBarometer = await Barometer.findByIdAndUpdate(barometerData._id, barometerData)
    if (!updatedBarometer)
      return NextResponse.json({ message: 'Barometer not found' }, { status: 404 })
    revalidatePath(`/collection/items/${slug}`)
    return NextResponse.json({ slug }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error updating barometer' },
      { status: 500 },
    )
  }
}
