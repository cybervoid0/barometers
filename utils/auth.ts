import type { AuthOptions, User } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcrypt'
import { connectMongoose } from './mongoose'
import UserModel from '@/models/user'

export const authConfig: AuthOptions = {
  providers: [
    Credentials({
      name: 'Credentials',
      id: 'credentials',
      credentials: {
        email: { label: 'email', type: 'email', required: true },
        password: { label: 'password', type: 'password', required: true },
      },
      authorize: async credentials => {
        if (!credentials) throw new Error('Unknown credentials')
        await connectMongoose()
        const user = await UserModel.findOne({
          email: credentials.email,
        }).select('+password')
        if (!user) throw new Error('User not found')
        if (!user.password) throw new Error('Password is not stored')
        const passwordMatch = await bcrypt.compare(credentials.password, user.password)
        if (!passwordMatch) throw new Error('Wrong Password')
        return user as User
      },
    }),
  ],
  pages: {
    // redirect on protected routes
    signIn: '/signin',
  },
  session: {
    strategy: 'jwt',
  },
}
