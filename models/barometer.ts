import { Schema, model, models, type Model } from 'mongoose'
import { IManufacturer } from './manufacturer'
import { IBarometerType } from './type'
import { IBarometerCondition } from './condition'

export interface IBarometer {
  _id?: string
  collectionId: string
  name: string
  slug?: string
  type: IBarometerType
  condition: IBarometerCondition
  dating?: string
  manufacturer?: IManufacturer
  dimensions?: { dim: string; value: string }[]
  description?: string
  images?: string[]
}

const barometerSchema = new Schema<IBarometer>(
  {
    collectionId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      unique: true,
      type: String,
      required: true,
      minlength: 2,
      maxlength: 200,
    },
    slug: {
      unique: true,
      type: String,
      required: true,
    },
    type: {
      type: Schema.Types.ObjectId,
      ref: 'BarometerType',
      required: true,
    },
    dating: {
      type: String,
      required: false,
    },
    condition: {
      type: Schema.Types.ObjectId,
      ref: 'BarometerCondition',
      required: true,
    },
    manufacturer: {
      type: Schema.Types.ObjectId,
      ref: 'Manufacturer',
      required: false,
    },
    dimensions: {
      type: Schema.Types.Mixed,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    images: {
      type: [String],
      required: false,
    },
  },
  {
    timestamps: true,
  },
)

const Barometer: Model<IBarometer> =
  models?.Barometer || model<IBarometer>('Barometer', barometerSchema)
export default Barometer
