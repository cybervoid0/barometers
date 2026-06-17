'use server'

import { revalidateTag } from 'next/cache'
import { after } from 'next/server'
import { z } from 'zod'
import { Tag } from '@/constants'
import { prisma } from '@/prisma/prismaClient'
import { requireAdmin } from '@/server/auth'
import { savePdfs } from '@/server/files/pdfs'
import { deleteFileFromStorage } from '@/server/files/storage'
import type { ActionResult } from '@/types'
import { CreateEssaySchema, UpdateEssaySchema } from './schemas'

export async function createEssay(rawData: unknown) {
  await requireAdmin()
  const { pdfFiles, ...data } = CreateEssaySchema.parse(rawData)
  const [pdf] = await savePdfs(pdfFiles)

  const { id, title } = await prisma.essay.create({
    data: { ...data, pdfUrl: pdf.url, pdfName: pdf.name },
    select: { id: true, title: true },
  })

  revalidateTag(Tag.essays, 'max')
  return { id, title }
}

export async function updateEssay(
  rawData: unknown,
): Promise<ActionResult<{ id: string; title: string }>> {
  await requireAdmin()
  const { id, pdfFiles, ...updateData } = UpdateEssaySchema.parse(rawData)

  try {
    let pdfFields: { pdfUrl: string; pdfName: string } | undefined
    let oldPdfUrl: string | undefined

    if (pdfFiles) {
      const existing = await prisma.essay.findUnique({ where: { id }, select: { pdfUrl: true } })
      const [pdf] = await savePdfs(pdfFiles)
      pdfFields = { pdfUrl: pdf.url, pdfName: pdf.name }
      if (existing && existing.pdfUrl !== pdf.url) oldPdfUrl = existing.pdfUrl
    }

    const result = await prisma.essay.update({
      where: { id },
      data: { ...updateData, ...pdfFields },
      select: { id: true, title: true },
    })

    // drop the orphaned PDF only after the row points at the new one
    if (oldPdfUrl) {
      const url = oldPdfUrl
      after(() => deleteFileFromStorage({ url, name: '' }).catch(console.error))
    }
    revalidateTag(Tag.essays, 'max')
    return { success: true, data: result }
  } catch (error) {
    console.error('Error updating essay:', error)
    return { success: false, error: 'Failed to update essay. Please try again.' }
  }
}

export async function deleteEssay(rawId: unknown): Promise<ActionResult<{ id: string }>> {
  await requireAdmin()
  const id = z.string().min(1).parse(rawId)
  try {
    const { pdfUrl } = await prisma.essay.delete({
      where: { id },
      select: { pdfUrl: true },
    })
    after(() => deleteFileFromStorage({ url: pdfUrl, name: '' }).catch(console.error))
    revalidateTag(Tag.essays, 'max')
    return { success: true, data: { id } }
  } catch (error) {
    console.error('Error deleting essay:', error)
    return { success: false, error: 'Failed to delete essay. Please try again.' }
  }
}
