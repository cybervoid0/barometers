import mongoose from 'mongoose'

let isConnected = false

export const connectMongoose = async () => {
  mongoose.set('strictQuery', true)

  if (isConnected) return
  const { connection } = await mongoose.connect(process.env.MONGODB_URI)
  if (connection.readyState !== 1) throw new Error('Mongo connection is not ready')
  isConnected = true
}
