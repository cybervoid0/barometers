'use server'

import { z } from 'zod'
import { requireAdmin } from '@/server/auth'
import type { MediaFile } from '@/types'
import { slug } from '@/utils'
import { mediaFileSchema } from './schemas'
import { saveFileToStorage } from './storage'

async function savePdfs(rawFiles: unknown): Promise<MediaFile[]> {
  await requireAdmin()
  const files = z.array(mediaFileSchema).parse(rawFiles)
  return await Promise.all(
    files.map(async ({ url, name }) => ({
      url: await savePdf(url, name),
      name,
    })),
  )
}

async function savePdf(tempUrl: string, title: string): Promise<string> {
  if (!tempUrl.startsWith('temp/')) return tempUrl
  const permanentUrl = generatePdfName(title)
  await saveFileToStorage(tempUrl, permanentUrl)
  return permanentUrl
}

function generatePdfName(title: string): string {
  const random = crypto.randomUUID().slice(0, 8)
  return `pdf/${slug(title)}__${random}.pdf`
}

export { savePdfs }
