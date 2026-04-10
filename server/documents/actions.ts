'use server'

import type { Prisma } from '@prisma/client'
import { revalidateTag } from 'next/cache'
import { z } from 'zod'
import { Tag } from '@/constants'
import { prisma } from '@/prisma/prismaClient'
import { requireAdmin } from '@/server/auth'
import type { ActionResult } from '@/types'
import { CreateDocumentSchema, UpdateDocumentSchema } from './schemas'

export async function createDocument(rawData: unknown) {
  await requireAdmin()
  const data = CreateDocumentSchema.parse(rawData)
  const { id, title } = await prisma.document.create({
    data,
  })
  revalidateTag(Tag.documents, 'max')
  return { id, title }
}

export async function updateDocument(
  rawData: unknown,
): Promise<ActionResult<{ id: string; title: string }>> {
  await requireAdmin()
  const data = UpdateDocumentSchema.parse(rawData)
  const { id, ...updateData } = data

  try {
    const result = await prisma.document.update({
      where: { id },
      data: updateData as Prisma.DocumentUpdateInput,
    })

    revalidateTag(Tag.documents, 'max')
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
    revalidateTag(Tag.documents, 'max')
    return { success: true, data: { id } }
  } catch (error) {
    console.error('Error deleting document:', error)
    return { success: false, error: 'Failed to delete document. Please try again.' }
  }
}
