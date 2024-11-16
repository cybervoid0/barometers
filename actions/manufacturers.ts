'use server'

import { connectMongoose } from '@/utils/mongoose'
import Manufacturer, { IManufacturer } from '@/models/manufacturer'
import { cleanObject } from '@/utils/misc'

export async function listManufacturers(): Promise<IManufacturer[]> {
  await connectMongoose()
  const conditions = await Manufacturer.find()
  return conditions.map(obj => obj.toObject({ flattenObjectIds: true }))
}

export async function setManufacturer(manufData: IManufacturer): Promise<IManufacturer> {
  await connectMongoose()
  const cleanData = cleanObject(manufData)
  const newManufacturer = new Manufacturer(cleanData)
  await newManufacturer.save()
  return newManufacturer.toObject({ flattenObjectIds: true })
}

export async function deleteManufacturer(id: string) {
  await connectMongoose()
  const deletedManufacturer = await Manufacturer.findByIdAndDelete(id)
  if (!deletedManufacturer) throw new Error('Unknown manufacturer')
}
