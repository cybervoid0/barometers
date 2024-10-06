import { Schema, model, Document, models, type Model } from 'mongoose'

export interface IBarometerType extends Document {
  name: string
  description?: string
  label: string
  order: number
  image?: string
}

/**
 * Schema for barometer types
 */
const barometerTypeSchema = new Schema<IBarometerType>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: false,
  },
  label: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    required: true,
  },
})

const BarometerType: Model<IBarometerType> =
  models?.BarometerType || model<IBarometerType>('BarometerType', barometerTypeSchema)

export default BarometerType
