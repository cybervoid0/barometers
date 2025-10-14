'use server'

import type { MediaFile } from '@/types'
import { slug } from '@/utils'
import { saveFile } from './actions'

async function savePdfs(files: MediaFile[]) {
  return await Promise.all(
    files.map(async ({ url, name }) => ({
      url: await savePdf(url, name),
      name,
    })),
  )
}

async function savePdf(tempUrl: string, name: string): Promise<string> {
  if (!tempUrl.startsWith('temp/')) return tempUrl
  const permanentUrl = `pdf/${slug(name)}.pdf`
  await saveFile(tempUrl, permanentUrl)
  return permanentUrl
}

export { savePdfs }
