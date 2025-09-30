// client function

import { createTempImage } from './actions'

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

function storeImages(files: File[]) {
  return Promise.all(
    files.map(async file => {
      // cannot pass file to server function directly -> first generate URLs
      const tempSignedUrl = await createTempImage(file.name)
      await uploadFileToCloud(tempSignedUrl, file)
      // take last two segments of the path: gallery/filename.jpg
      return new URL(tempSignedUrl).pathname.split('/').slice(-2).join('/')
    }),
  )
}

export { storeImages }
