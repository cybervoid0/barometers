import { Schema, model, models, type Model } from 'mongoose'

export interface IManufacturer {
  _id?: string
  name: string
  country?: string
  city?: string
  description?: string
}

/**
 * Schema for barometer manufacturers
 */
const manufacturerSchema = new Schema<IManufacturer>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      minlength: 2,
      maxlength: 100,
    },
    country: {
      type: String,
      required: false,
      maxlength: 100,
      default: undefined,
    },
    city: {
      type: String,
      required: false,
      maxlength: 100,
      default: undefined,
    },
    description: {
      type: String,
      required: false,
      default: undefined,
    },
  },
  {
    timestamps: true,
  },
)
manufacturerSchema.index({
  name: 'text',
  description: 'text',
})

const Manufacturer: Model<IManufacturer> =
  models?.Manufacturer || model<IManufacturer>('Manufacturer', manufacturerSchema)

export default Manufacturer
