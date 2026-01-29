'use server'

import type { User } from '@prisma/client'
import { hash } from 'bcrypt'
import { prisma } from '@/prisma/prismaClient'

export async function register(values: Partial<User>) {
  const { email, password, name } = values
  if (!password) throw new Error('Password is not defined')
  if (!email) throw new Error('Email is not defined')
  if (!name) throw new Error('Name is not defined')
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
}
