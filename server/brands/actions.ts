'use server'

import { Prisma } from '@prisma/client'
import { updateTag } from 'next/cache'
import { z } from 'zod'
import { Tag } from '@/constants'
import { prisma } from '@/prisma/prismaClient'
import { requireAdmin } from '@/server/auth'
import type { ActionResult } from '@/types'
import { getIconBuffer } from '@/utils'
import { CreateBrandSchema, UpdateBrandSchema } from './schemas'

export async function createBrand(
  rawData: unknown,
): Promise<ActionResult<{ id: string; name: string }>> {
  await requireAdmin()
  const data = CreateBrandSchema.parse(rawData)
  const { icon, ...createData } = data

  // Convert icon string to Buffer if provided
  const iconBuffer = getIconBuffer(icon)

  try {
    const { id, name } = await prisma.manufacturer.create({
      data: {
        ...createData,
        icon: iconBuffer,
      },
    })
    updateTag(Tag.brands)
    updateTag(Tag.barometers)
    return { success: true, data: { id, name } }
  } catch (error) {
    // Handle unique constraint violations
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { success: false, error: `Brand with name "${createData.name}" already exists` }
    }

    console.error('Error creating brand:', error)
    return { success: false, error: 'Failed to create brand. Please try again.' }
  }
}

export async function updateBrand(
  rawData: unknown,
): Promise<ActionResult<{ slug: string; name: string }>> {
  await requireAdmin()
  const data = UpdateBrandSchema.parse(rawData)
  const { id, icon, ...updateData } = data

  try {
    // Convert icon string to Buffer if provided
    const iconBuffer = getIconBuffer(icon)

    const { slug, name } = await prisma.manufacturer.update({
      where: { id },
      data: {
        ...updateData,
        icon: iconBuffer,
      },
    })

    updateTag(Tag.brands)
    updateTag(Tag.barometers)
    return { success: true, data: { slug, name } }
  } catch (error) {
    console.error('Error updating brand:', error)
    return { success: false, error: 'Failed to update brand. Please try again.' }
  }
}

export async function deleteBrand(rawSlug: unknown) {
  await requireAdmin()
  const slug = z.string().min(1).parse(rawSlug)
  const manufacturer = await prisma.manufacturer.findUniqueOrThrow({ where: { slug } })
  await prisma.manufacturer.delete({
    where: {
      id: manufacturer.id,
    },
  })
  updateTag(Tag.brands)
  updateTag(Tag.barometers)
}
