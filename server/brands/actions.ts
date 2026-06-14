'use server'

import { Prisma } from '@prisma/client'
import { updateTag } from 'next/cache'
import { after } from 'next/server'
import { z } from 'zod'
import { Tag } from '@/constants'
import { prisma } from '@/prisma/prismaClient'
import { requireAdmin } from '@/server/auth'
import { createBlurData, saveTempImages } from '@/server/files/persist-images'
import { type ActionResult, ImageType } from '@/types'
import { getBrandFileSlug, getIconBuffer } from '@/utils'
import { CreateBrandSchema, UpdateBrandSchema } from './schemas'

export async function createBrand(
  rawData: unknown,
): Promise<ActionResult<{ id: string; name: string }>> {
  await requireAdmin()
  const { icon, images, ...createData } = CreateBrandSchema.parse(rawData)

  // Convert icon string to Buffer if provided
  const iconBuffer = getIconBuffer(icon)

  try {
    const imageRows =
      images && images.length > 0
        ? await saveTempImages(
            images,
            ImageType.Brand,
            getBrandFileSlug(createData.name, createData.firstName),
          )
        : []

    const {
      id,
      name,
      images: createdImages,
    } = await prisma.manufacturer.create({
      data: {
        ...createData,
        icon: iconBuffer,
        images: imageRows.length > 0 ? { create: imageRows } : undefined,
      },
      select: { id: true, name: true, images: { select: { id: true, url: true } } },
    })

    if (createdImages.length > 0) after(() => createBlurData(createdImages))
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
  const { id, icon, images, ...updateData } = UpdateBrandSchema.parse(rawData)

  try {
    // Convert icon string to Buffer if provided
    const iconBuffer = getIconBuffer(icon)

    // when images are provided, replace the whole set: persist temp uploads and
    // recreate rows atomically with the update (deleteMany drops the old links)
    const imageRows = images
      ? await saveTempImages(
          images,
          ImageType.Brand,
          updateData.name ? getBrandFileSlug(updateData.name, updateData.firstName) : id,
        )
      : undefined

    const {
      slug,
      name,
      images: updatedImages,
    } = await prisma.manufacturer.update({
      where: { id },
      data: {
        ...updateData,
        icon: iconBuffer,
        images: imageRows ? { deleteMany: {}, create: imageRows } : undefined,
      },
      select: { slug: true, name: true, images: { select: { id: true, url: true } } },
    })

    if (imageRows && updatedImages.length > 0) after(() => createBlurData(updatedImages))
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
