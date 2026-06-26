'use server'

import { hash } from 'bcrypt'
import { z } from 'zod'
import { prisma } from '@/prisma/prismaClient'

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
  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: 'USER',
    },
  })

  // NOTE: guest orders are intentionally NOT linked here. Registration does not
  // prove ownership of the email (there is no verification step), so linking on
  // sign-up would let anyone claim a guest's order history + shipping PII just
  // by registering with their email. Linking happens on LOGIN instead, where the
  // password proves account control (see services/auth.ts authorize()).
}
