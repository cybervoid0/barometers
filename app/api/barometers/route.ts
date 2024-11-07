import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { connectMongoose } from '@/utils/mongoose'
import Barometer, { IBarometer } from '@/models/barometer'
import BarometerType from '@/models/type'
import '@/models/condition'
import Manufacturer from '@/models/manufacturer'
import { cleanObject, slug as slugify, parseDate } from '@/utils/misc'
import { SortValue } from '@/app/collection/types/[type]/types'

function sortBarometers(barometers: IBarometer[], sortBy: SortValue | null): IBarometer[] {
  return barometers.toSorted((a, b) => {
    switch (sortBy) {
      case 'manufacturer':
        return (a.manufacturer?.name ?? '').localeCompare(b.manufacturer?.name ?? '')
      case 'name':
        return a.name.localeCompare(b.name)
      case 'date': {
        if (!a.dating || !b.dating) return 0
        const yearA = parseDate(a.dating)?.[0]
        const yearB = parseDate(b.dating)?.[0]
        if (!yearA || !yearB) return 0
        const dateA = new Date(yearA, 0, 1).getTime()
        const dateB = new Date(yearB, 0, 1).getTime()
        return dateA - dateB
      }
      case 'cat-no':
        return a.collectionId.localeCompare(b.collectionId)
      default:
        return 0
    }
  })
}

/**
 * Get barometer list
 *
 * GET /api/barometers?type=type
 */
export async function GET(req: NextRequest) {
  try {
    await connectMongoose()
    const { searchParams } = new URL(req.url)
    const typeName = searchParams.get('type')
    const sortBy = searchParams.get('sort') as SortValue | null
    // if `type` search param was not passed return all barometers list
    if (!typeName || !typeName.trim()) {
      const barometers = sortBarometers(
        await Barometer.find().populate(['type', 'condition', 'manufacturer']),
        sortBy,
      )
      return NextResponse.json(barometers, { status: 200 })
    }
    // if some non-empty `type` was passed, perform case-insensitive compare with the stored types
    const barometerType = await BarometerType.findOne({
      name: { $regex: new RegExp(`^${typeName}$`, 'i') },
    })
    if (!barometerType) return NextResponse.json([], { status: 404 })

    // if existing barometer type match the `type` param, return all corresponding barometers
    const barometers = sortBarometers(
      await Barometer.find({ type: barometerType._id }).populate([
        'type',
        'condition',
        'manufacturer',
      ]),
      sortBy,
    )
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
  try {
    await connectMongoose()
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
  try {
    await connectMongoose()
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
