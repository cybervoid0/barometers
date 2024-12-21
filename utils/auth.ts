import type { AuthOptions, User } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcrypt'
import { withPrisma } from '@/prisma/prismaClient'

export const getUserByEmail = withPrisma((prisma, email?: string | null | undefined) =>
  prisma.user.findUniqueOrThrow({ where: { email: email ?? undefined } }),
)

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
        const user = await getUserByEmail(credentials.email)
        if (!user.password) throw new Error('Password is not stored')
        const passwordMatch = await bcrypt.compare(credentials.password, user.password)
        if (!passwordMatch) throw new Error('Wrong Password')
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatarURL,
        } as User
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
