import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { connectMongoose } from '@/utils/mongoose'
import Barometer, { IBarometer } from '@/models/barometer'
import BarometerType from '@/models/type'
import '@/models/condition'
import Manufacturer from '@/models/manufacturer'
import { cleanObject, slug as slugify } from '@/utils/misc'
import { SortValue } from '@/app/collection/types/[type]/types'
import { DEFAULT_PAGE_SIZE, type PaginationDTO } from '../types'

function getSortCriteria(sortBy: SortValue | null): Record<string, 1 | -1> {
  switch (sortBy) {
    case 'manufacturer':
      return { 'manufacturer.name': 1 }
    case 'name':
      return { name: 1 }
    case 'date':
      return { 'dating.year': 1 }
    case 'cat-no':
      return { collectionId: 1 }
    default:
      return { name: 1 }
  }
}

/**
 * Find a list of barometers of a certain type
 */
async function getBarometersByType(
  typeName: string,
  page: number,
  pageSize: number,
  sortBy: SortValue | null,
) {
  // perform case-insensitive compare with the stored types
  const barometerType = await BarometerType.findOne({
    name: { $regex: new RegExp(`^${typeName}$`, 'i') },
  })
  if (!barometerType) return NextResponse.json([], { status: 404 })

  // if existing barometer type match the `type` param, return all corresponding barometers
  const skip = (page - 1) * pageSize
  const sortCriteria = getSortCriteria(sortBy)

  const barometers = await Barometer.aggregate([
    {
      $match: { type: barometerType._id },
    },
    {
      $lookup: {
        from: 'manufacturers',
        localField: 'manufacturer',
        foreignField: '_id',
        as: 'manufacturer',
      },
    },
    { $unwind: { path: '$manufacturer', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'barometerTypes',
        localField: 'type',
        foreignField: '_id',
        as: 'type',
      },
    },
    { $unwind: { path: '$type', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'barometerConditions',
        localField: 'condition',
        foreignField: '_id',
        as: 'condition',
      },
    },
    { $unwind: { path: '$condition', preserveNullAndEmptyArrays: true } },
    {
      $sort: sortCriteria,
    },
    { $skip: skip },
    { $limit: pageSize },
  ])

  const totalItems = await Barometer.countDocuments({ type: barometerType._id })

  return NextResponse.json<PaginationDTO>(
    {
      barometers,
      page,
      totalItems,
      pageSize,
      totalPages: Math.ceil(totalItems / pageSize),
    },
    { status: barometers.length > 0 ? 200 : 404 },
  )
}

/**
 * List all barometers
 */
async function getAllBarometers() {
  const barometers = await Barometer.find().populate(['type', 'condition', 'manufacturer'])
  return NextResponse.json(barometers, { status: 200 })
}

/**
 * Get barometer list
 *
 * GET /api/barometers?type=type
 */
export async function GET(req: NextRequest) {
  try {
    await connectMongoose()
    const { searchParams } = req.nextUrl
    const typeName = searchParams.get('type')
    const sortBy = searchParams.get('sort') as SortValue | null
    const size = Math.max(Number(searchParams.get('size')) || DEFAULT_PAGE_SIZE, 1)
    const page = Math.max(Number(searchParams.get('page')) || 1, 1)
    // if `type` search param was not passed return all barometers list
    if (!typeName || !typeName.trim()) return await getAllBarometers()
    // type was passed
    return await getBarometersByType(typeName, page, size, sortBy)
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
    revalidatePath('/')
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
