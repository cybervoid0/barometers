'use server'

import type { Prisma } from '@prisma/client'
import { revalidateTag } from 'next/cache'
import { Tag } from '@/constants'
import { withPrisma } from '@/prisma/prismaClient'
import type { ActionResult } from '@/types'

const createDocument = withPrisma(async (prisma, data: Prisma.DocumentUncheckedCreateInput) => {
  const { id, title } = await prisma.document.create({
    data,
  })
  revalidateTag(Tag.documents, 'max')
  return { id, title }
})

const updateDocument = withPrisma(
  async (
    prisma,
    data: Prisma.DocumentUpdateInput & { id: string },
  ): Promise<ActionResult<{ id: string; title: string }>> => {
    const { id, ...updateData } = data

    try {
      const result = await prisma.document.update({
        where: { id },
        data: updateData,
      })

      revalidateTag(Tag.documents, 'max')
      return { success: true, data: { id: result.id, title: result.title } }
    } catch (error) {
      console.error('Error updating document:', error)
      return { success: false, error: 'Failed to update document. Please try again.' }
    }
  },
)

const deleteDocument = withPrisma(
  async (prisma, id: string): Promise<ActionResult<{ id: string }>> => {
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
  },
)

export { createDocument, updateDocument, deleteDocument }
