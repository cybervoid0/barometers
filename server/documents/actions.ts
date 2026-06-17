'use server'

import type { Prisma } from '@prisma/client'
import { updateTag } from 'next/cache'
import { after } from 'next/server'
import { z } from 'zod'
import { Tag } from '@/constants'
import { prisma } from '@/prisma/prismaClient'
import { requireAdmin } from '@/server/auth'
import { createBlurData, saveTempImages } from '@/server/files/images'
import { type ActionResult, ImageType } from '@/types'
import { CreateDocumentSchema, UpdateDocumentSchema } from './schemas'

export async function createDocument(rawData: unknown) {
  await requireAdmin()
  const { images, ...data } = CreateDocumentSchema.parse(rawData)

  const imageRows =
    images && images.length > 0
      ? await saveTempImages(images, ImageType.Document, data.catalogueNumber)
      : []

  const {
    id,
    title,
    images: createdImages,
  } = await prisma.document.create({
    data: {
      ...data,
      images: imageRows.length > 0 ? { create: imageRows } : undefined,
    },
    select: { id: true, title: true, images: { select: { id: true, url: true } } },
  })

  if (createdImages.length > 0) after(() => createBlurData(createdImages))
  updateTag(Tag.documents)
  return { id, title }
}

export async function updateDocument(
  rawData: unknown,
): Promise<ActionResult<{ id: string; title: string }>> {
  await requireAdmin()
  const { id, images, ...updateData } = UpdateDocumentSchema.parse(rawData)

  try {
    // when images are provided, replace the whole set: persist temp uploads and
    // recreate rows atomically with the update (deleteMany drops the old links)
    const imageRows = images
      ? await saveTempImages(images, ImageType.Document, updateData.catalogueNumber ?? id)
      : undefined

    const result = await prisma.document.update({
      where: { id },
      data: {
        ...(updateData as Prisma.DocumentUpdateInput),
        images: imageRows ? { deleteMany: {}, create: imageRows } : undefined,
      },
      select: { id: true, title: true, images: { select: { id: true, url: true } } },
    })

    if (imageRows && result.images.length > 0) after(() => createBlurData(result.images))
    updateTag(Tag.documents)
    return { success: true, data: { id: result.id, title: result.title } }
  } catch (error) {
    console.error('Error updating document:', error)
    return { success: false, error: 'Failed to update document. Please try again.' }
  }
}

export async function deleteDocument(rawId: unknown): Promise<ActionResult<{ id: string }>> {
  await requireAdmin()
  const id = z.string().min(1).parse(rawId)
  try {
    await prisma.document.delete({
      where: { id },
    })
    updateTag(Tag.documents)
    return { success: true, data: { id } }
  } catch (error) {
    console.error('Error deleting document:', error)
    return { success: false, error: 'Failed to delete document. Please try again.' }
  }
}
