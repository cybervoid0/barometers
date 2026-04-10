'use server'

import { z } from 'zod'
import { requireAdmin } from '@/server/auth'
import { mediaFileSchema } from './schemas'
import { createPresignedUrl, deleteFileFromStorage, saveFileToStorage } from './storage'

async function deleteFiles(rawFileNames?: unknown) {
  await requireAdmin()
  const parsed = z.array(mediaFileSchema).optional().parse(rawFileNames)
  if (!parsed || parsed.length === 0) return
  await Promise.all(parsed.map(deleteFileFromStorage))
}

async function deleteFile(rawFile: unknown) {
  await requireAdmin()
  const file = mediaFileSchema.parse(rawFile)
  await deleteFileFromStorage(file)
}

async function saveFile(rawTempUrl: unknown, rawFilename: unknown) {
  await requireAdmin()
  const tempUrl = z.string().min(1).parse(rawTempUrl)
  const filename = z.string().min(1).parse(rawFilename)
  await saveFileToStorage(tempUrl, filename)
}

async function createTempFile(rawFileName: unknown) {
  await requireAdmin()
  const fileName = z.string().min(1).parse(rawFileName)
  return createPresignedUrl(fileName)
}

export { deleteFiles, deleteFile, createTempFile, saveFile }
