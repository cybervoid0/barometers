import bcrypt from 'bcrypt'
import type { AuthOptions, User } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/prisma/prismaClient'

export async function getUserByEmail(email?: string | null | undefined) {
  return prisma.user.findUnique({ where: { email: email ?? undefined } })
}

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
        try {
          if (!credentials) throw new Error('Unknown credentials')
          const user = await getUserByEmail(credentials.email)
          if (!user?.password) throw new Error('Password is not stored')
          const passwordMatch = await bcrypt.compare(credentials.password, user.password)
          if (!passwordMatch) throw new Error('Wrong Password')
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.avatarURL,
            role: user.role,
          } as User
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
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
  callbacks: {
    async jwt({ token, user }) {
      // Adding Role to token if it exists in User
      if (user?.role) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      // Passing role from token to session
      if (token.role) {
        session.user.role = token.role
      }
      return session
    },
  },
}
