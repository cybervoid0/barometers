// client function

import { basename, extname } from 'node:path'
import type { MediaFile } from '@/types'
import { createTempFile } from './actions'

async function uploadFileToCloud(url: string, file: File) {
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  })
  if (!res.ok) throw new Error(res.statusText)
}

function storeFiles(files: File[]): Promise<MediaFile[]> {
  return Promise.all(
    files.map(async file => {
      // cannot pass file to server function directly -> first generate URLs
      const tempSignedUrl = await createTempFile(file.name)
      await uploadFileToCloud(tempSignedUrl, file)
      // take last two segments of the path: temp/filename.jpg
      return {
        url: new URL(tempSignedUrl).pathname.split('/').slice(-2).join('/'),
        name: basename(file.name, extname(file.name)), // name w/o extension
      }
    }),
  )
}

export { storeFiles }
