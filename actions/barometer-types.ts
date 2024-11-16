'use server'

import { connectMongoose } from '@/utils/mongoose'
import BarometerType, { IBarometerType } from '@/models/type'

export async function getType(type: string): Promise<IBarometerType> {
  await connectMongoose()
  const barometerType = await BarometerType.findOne({ name: { $regex: type, $options: 'i' } })
  if (!barometerType) throw new Error('Unknown barometer type')
  return { ...barometerType.toObject(), _id: String(barometerType._id) }
}

export async function listTypes(): Promise<IBarometerType[]> {
  await connectMongoose()
  return (await BarometerType.find().sort({ order: 1 })).map(res =>
    res.toObject({ flattenObjectIds: true }),
  )
}
