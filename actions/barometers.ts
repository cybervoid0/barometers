'use server'

import { revalidatePath } from 'next/cache'
import { connectMongoose } from '@/utils/mongoose'
import Barometer, { IBarometer } from '@/models/barometer'
import { cleanObject, slug as slugify, parseDate } from '@/utils/misc'
import { SortValue } from '@/app/collection/types/[type]/types'
import BarometerType from '@/models/type'
import Manufacturer from '@/models/manufacturer'
import '@/models/condition'

/**
 * Related tables to include in database response
 */
const dependencies = ['type', 'condition', 'manufacturer']

export async function getBarometer(slug: string): Promise<IBarometer> {
  await connectMongoose()
  const barometer = await Barometer.findOne({ slug }).populate(dependencies)
  if (!barometer) throw new Error('Unknown slug')
  return barometer.toObject({ flattenObjectIds: true })
}

/**
 * Server function which creates new barometer in the database and generates corresponding page
 * @returns created barometer slug
 */
export async function createBarometer(barometerData: IBarometer) {
  await connectMongoose()
  const cleanData = cleanObject(barometerData)
  const slug = slugify(cleanData.name)
  cleanData.slug = slug
  const newBarometer = new Barometer(cleanData)
  await newBarometer.save()
  revalidatePath(`/collection/items/${slug}`)
  return slug
}

/**
 * Server function which updates existing barometer with new data and regenerates corresponding page
 * @returns updated barometer slug (may differ from the original)
 */
export async function updateBarometer(barometerData: IBarometer): Promise<string> {
  await connectMongoose()
  const slug = slugify(barometerData.name)
  barometerData.slug = slug
  await Manufacturer.findByIdAndUpdate(barometerData.manufacturer?._id, barometerData.manufacturer)
  const updatedBarometer = await Barometer.findByIdAndUpdate(barometerData._id, barometerData)
  if (!updatedBarometer) throw new Error('Barometer not found')
  revalidatePath(`/collection/items/${slug}`)
  return slug
}

export async function listBarometers(options?: {
  type?: string
  sort?: SortValue
}): Promise<IBarometer[]> {
  await connectMongoose()
  const sortBy = options?.sort ?? 'date'
  if (!options?.type) return sortBarometers(await Barometer.find().populate(dependencies), sortBy)
  const barometerType = await BarometerType.findOne({
    name: { $regex: new RegExp(`^${options.type}$`, 'i') },
  })
  if (!barometerType) throw new Error('Unknown barometer type')
  return sortBarometers(
    (await Barometer.find({ type: barometerType._id }).populate(dependencies)).map(res =>
      res.toObject({ flattenObjectIds: true }),
    ),
    sortBy,
  )
}

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
