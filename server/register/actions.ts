'use server'

import { hash } from 'bcrypt'
import { z } from 'zod'
import { prisma } from '@/prisma/prismaClient'
import { linkGuestOrdersToUser } from '@/server/customers/link-guest-orders'

const RegisterSchema = z.object({
  name: z.string().min(1, 'Name is not defined'),
  email: z.email('Invalid email'),
  password: z.string().min(1, 'Password is not defined'),
})

export async function register(rawValues: unknown) {
  const { email, password, name } = RegisterSchema.parse(rawValues)
  const userFound = await prisma.user.findUnique({ where: { email } })
  if (userFound) throw new Error('Email already exists!')
  const hashedPassword = await hash(password, 10)
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: 'USER',
    },
  })

  // Attach any prior guest checkouts (same email) to the new account.
  // Non-fatal: a linking failure must never break registration.
  try {
    await linkGuestOrdersToUser(user.id, email)
  } catch (error) {
    console.error('Failed to link guest orders on register:', error)
  }
}
