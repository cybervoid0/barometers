'use server'

import { Prisma } from '@prisma/client'
import { updateTag } from 'next/cache'
import { after } from 'next/server'
import { z } from 'zod'
import { Tag } from '@/constants'
import { prisma } from '@/prisma/prismaClient'
import { requireAdmin } from '@/server/auth'
import { createBlurData, saveTempImages } from '@/server/files/images'
import { type ActionResult, ImageType, type MediaFile } from '@/types'
import { slug as slugify } from '@/utils'
import { deleteFiles } from '../files/actions'
import { CreateBarometerSchema, UpdateBarometerSchema } from './schemas'

export async function createBarometer(rawData: unknown): Promise<ActionResult<{ id: string }>> {
  await requireAdmin()
  const { images, ...data } = CreateBarometerSchema.parse(rawData)
  try {
    // move temp uploads to permanent storage, then create the barometer + image
    // rows in a single write so a failed create never leaves orphan Image rows
    const imageRows =
      images && images.length > 0
        ? await saveTempImages(images, ImageType.Barometer, data.collectionId)
        : []

    const created = await prisma.barometer.create({
      data: {
        ...data,
        description: data.description ?? '',
        images: imageRows.length > 0 ? { create: imageRows } : undefined,
      },
      select: { id: true, images: { select: { id: true, url: true } } },
    })

    if (created.images.length > 0) after(() => createBlurData(created.images))
    updateTag(Tag.barometers)
    return { success: true, data: { id: created.id } }
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
  const { id, images, ...data } = UpdateBarometerSchema.parse(rawData)
  try {
    const oldBarometer = await prisma.barometer.findUniqueOrThrow({
      where: { id },
    })
    // create new slug if name changed
    const slug = data.name ? slugify(data.name) : oldBarometer.slug

    // when images are provided, replace the whole set: persist temp uploads and
    // recreate rows atomically with the update (deleteMany drops the old links)
    const imageRows = images
      ? await saveTempImages(images, ImageType.Barometer, data.collectionId ?? id)
      : undefined

    const updated = await prisma.barometer.update({
      where: { id },
      data: {
        ...data,
        slug,
        images: imageRows ? { deleteMany: {}, create: imageRows } : undefined,
      },
      select: { images: { select: { id: true, url: true } } },
    })

    if (imageRows && updated.images.length > 0) after(() => createBlurData(updated.images))
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
