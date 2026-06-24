import bcrypt from 'bcrypt'
import type { AuthOptions, User } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/prisma/prismaClient'
import { linkGuestOrdersToUser } from '@/server/customers/link-guest-orders'

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

          // Attach any guest checkouts made with this email to the account.
          // Non-fatal: linking must never block a valid login.
          try {
            await linkGuestOrdersToUser(user.id, user.email)
          } catch (linkError) {
            console.error('Failed to link guest orders on login:', linkError)
          }

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
      if (session.user) {
        // token.sub holds the user id — expose it so pages can authorize by user
        session.user.id = token.sub as string
        if (token.role) {
          session.user.role = token.role
        }
      }
      return session
    },
  },
}
