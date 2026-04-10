'use server'

import { Prisma } from '@prisma/client'
import { updateTag } from 'next/cache'
import { Tag } from '@/constants'
import { prisma } from '@/prisma/prismaClient'
import { requireAdmin } from '@/server/auth'
import type { ActionResult } from '@/types'
import { CreateMaterialSchema, DeleteMaterialSchema } from './schemas'

export async function createMaterial(
  rawData: unknown,
): Promise<ActionResult<{ id: number; name: string }>> {
  await requireAdmin()
  const data = CreateMaterialSchema.parse(rawData)

  try {
    const { id, name } = await prisma.material.create({ data })
    updateTag(Tag.materials)
    updateTag(Tag.barometers)
    return { success: true, data: { id, name } }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { success: false, error: `Material with name "${data.name}" already exists` }
    }

    console.error('Error creating material:', error)
    return { success: false, error: 'Failed to create material. Please try again.' }
  }
}

export async function deleteMaterial(rawData: unknown): Promise<ActionResult<{ id: number }>> {
  await requireAdmin()
  const { id } = DeleteMaterialSchema.parse(rawData)

  try {
    await prisma.material.delete({ where: { id } })
    updateTag(Tag.materials)
    updateTag(Tag.barometers)
    return { success: true, data: { id } }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return { success: false, error: 'Cannot delete material that is used by barometers' }
    }

    console.error('Error deleting material:', error)
    return { success: false, error: 'Failed to delete material. Please try again.' }
  }
}
