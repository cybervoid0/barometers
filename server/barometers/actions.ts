'use server'

import { Prisma } from '@prisma/client'
import { updateTag } from 'next/cache'
import { Tag } from '@/constants'
import { prisma } from '@/prisma/prismaClient'
import type { ActionResult, MediaFile } from '@/types'
import { slug as slugify } from '@/utils'
import { deleteFiles } from '../files/actions'

export async function createBarometer(
  data: Prisma.BarometerUncheckedCreateInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { id } = await prisma.barometer.create({
      data,
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
  data: Prisma.BarometerUncheckedUpdateInput,
): Promise<ActionResult<{ slug: string; name: string }>> {
  try {
    const oldBarometer = await prisma.barometer.findUniqueOrThrow({
      where: { id: data.id as string },
    })
    // create new slug if name changed
    const slug = data.name ? slugify(data.name as string) : oldBarometer.slug
    await prisma.barometer.update({
      where: { id: data.id as string },
      data: {
        ...data,
        slug,
      },
    })
    updateTag(Tag.barometers)
    const name = (data.name as string) ?? oldBarometer.name
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

export async function deleteBarometer(slug: string): Promise<ActionResult<{ id: string }>> {
  try {
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
