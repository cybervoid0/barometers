'use server'

import { Prisma } from '@prisma/client'
import { updateTag } from 'next/cache'
import { z } from 'zod'
import { Tag } from '@/constants'
import { prisma } from '@/prisma/prismaClient'
import { requireAdmin } from '@/server/auth'
import type { ActionResult, MediaFile } from '@/types'
import { slug as slugify } from '@/utils'
import { deleteFiles } from '../files/actions'
import { CreateBarometerSchema, UpdateBarometerSchema } from './schemas'

export async function createBarometer(rawData: unknown): Promise<ActionResult<{ id: string }>> {
  await requireAdmin()
  const data = CreateBarometerSchema.parse(rawData)
  try {
    const { id } = await prisma.barometer.create({
      data: { ...data, description: data.description ?? '' },
    })
    updateTag(Tag.barometers)
    return { success: true, data: { id } }
  } catch (error) {
    // Handle unique constraint violations
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return {
        success: false,
        error: `Barometer with name "${data.name}" and cat.no. "${data.collectionId}" already exists`,
      }
    }

    console.error('Error creating barometer:', error)
    return { success: false, error: 'Failed to create barometer. Please try again.' }
  }
}

export async function updateBarometer(
  rawData: unknown,
): Promise<ActionResult<{ slug: string; name: string }>> {
  await requireAdmin()
  const { id, ...data } = UpdateBarometerSchema.parse(rawData)
  try {
    const oldBarometer = await prisma.barometer.findUniqueOrThrow({
      where: { id },
    })
    // create new slug if name changed
    const slug = data.name ? slugify(data.name) : oldBarometer.slug
    await prisma.barometer.update({
      where: { id },
      data: {
        ...data,
        slug,
      },
    })
    updateTag(Tag.barometers)
    const name = data.name ?? oldBarometer.name
    return { success: true, data: { slug, name } }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return {
        success: false,
        error: 'This value is already used in another barometer',
      }
    }
    console.error('Error updating barometer:', error)
    return { success: false, error: 'Failed to update barometer. Please try again.' }
  }
}

export async function deleteBarometer(rawSlug: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin()
    const slug = z.string().min(1).parse(rawSlug)
    const barometer = await prisma.barometer.findFirstOrThrow({
      where: {
        slug: {
          equals: slug,
          mode: 'insensitive',
        },
      },
    })

    const args = {
      where: { barometers: { some: { id: barometer.id } } },
    }
    // save deleting images info
    const imagesBeforeDbUpdate = (await prisma.image.findMany({
      ...args,
      select: {
        url: true,
        name: true,
      },
    })) as MediaFile[]
    await prisma.$transaction(async tx => {
      await tx.image.deleteMany(args)
      await tx.barometer.delete({
        where: {
          id: barometer.id,
        },
      })
    })
    await deleteFiles(imagesBeforeDbUpdate)
    updateTag(Tag.barometers)
    return { success: true, data: { id: barometer.id } }
  } catch (error) {
    console.error('Error deleting barometer:', error)
    return { success: false, error: 'Failed to delete barometer. Please try again.' }
  }
}
