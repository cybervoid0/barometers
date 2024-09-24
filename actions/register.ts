'use server'

import { hash } from 'bcrypt'
import { connectMongoose } from '@/utils/mongoose'
import User, { IUser } from '@/models/user'

export const register = async (values: Partial<IUser>): Promise<void> => {
  const { email, password, name } = values
  if (!password) throw new Error('Password is not defined')
  if (!email) throw new Error('Email is not defined')
  if (!name) throw new Error('Name is not defined')
  await connectMongoose()
  const userFound = await User.findOne({ email })
  if (userFound) throw new Error('Email already exists!')
  const hashedPassword = await hash(password, 10)
  const user = new User({
    name,
    email,
    password: hashedPassword,
  })
  await user.save()
}
