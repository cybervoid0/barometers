'use server'

import type { MediaFile } from '@/types'
import { slug } from '@/utils'
import { saveFile } from './actions'

async function savePdfs(files: MediaFile[]): Promise<MediaFile[]> {
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
  await saveFile(tempUrl, permanentUrl)
  return permanentUrl
}

function generatePdfName(title: string): string {
  const random = crypto.randomUUID().slice(0, 8)
  return `pdf/${slug(title)}__${random}.pdf`
}

export { savePdfs }
