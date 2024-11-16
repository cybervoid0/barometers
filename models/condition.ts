import { Schema, model, models, type Model } from 'mongoose'

export interface IBarometerCondition {
  _id: string
  name: string
  value: number
  description: string
}

/**
 * Schema for barometer conditions
 */
const barometerConditionSchema = new Schema<IBarometerCondition>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    value: {
      type: Number,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)
export const BarometerCondition: Model<IBarometerCondition> =
  models?.BarometerCondition ||
  model<IBarometerCondition>('BarometerCondition', barometerConditionSchema)

export default BarometerCondition
