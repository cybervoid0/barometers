'use server'

import { connectMongoose } from '@/utils/mongoose'
import BarometerCondition, { IBarometerCondition } from '@/models/condition'

export async function listConditions(): Promise<IBarometerCondition[]> {
  await connectMongoose()
  const conditions = await BarometerCondition.find()
  return conditions.map(condition => condition.toObject({ flattenObjectIds: true }))
}
