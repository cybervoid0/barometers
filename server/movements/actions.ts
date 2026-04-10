'use server'

import { Prisma } from '@prisma/client'
import { updateTag } from 'next/cache'
import { Tag } from '@/constants'
import { prisma } from '@/prisma/prismaClient'
import { requireAdmin } from '@/server/auth'
import type { ActionResult } from '@/types'
import { CreateMovementSchema, DeleteMovementSchema } from './schemas'

export async function createMovement(
  rawData: unknown,
): Promise<ActionResult<{ id: number; name: string }>> {
  await requireAdmin()
  const data = CreateMovementSchema.parse(rawData)

  try {
    const { id, name } = await prisma.subCategory.create({ data })
    updateTag(Tag.movements)
    updateTag(Tag.barometers)
    return { success: true, data: { id, name } }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { success: false, error: `Movement type with name "${data.name}" already exists` }
    }

    console.error('Error creating movement type:', error)
    return { success: false, error: 'Failed to create movement type. Please try again.' }
  }
}

export async function deleteMovement(rawData: unknown): Promise<ActionResult<{ id: number }>> {
  await requireAdmin()
  const { id } = DeleteMovementSchema.parse(rawData)

  try {
    await prisma.subCategory.delete({ where: { id } })
    updateTag(Tag.movements)
    updateTag(Tag.barometers)
    return { success: true, data: { id } }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return { success: false, error: 'Cannot delete movement type that is used by barometers' }
    }

    console.error('Error deleting movement type:', error)
    return { success: false, error: 'Failed to delete movement type. Please try again.' }
  }
}
