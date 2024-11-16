'use server'

import path from 'path'
import { v4 as uuid } from 'uuid'
import { GetSignedUrlConfig, Storage } from '@google-cloud/storage'

const decodedPrivateKey = Buffer.from(process.env.GCP_PRIVATE_KEY, 'base64').toString('utf-8')
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: {
    client_email: process.env.GCP_CLIENT_EMAIL,
    private_key: decodedPrivateKey,
  },
})
const bucket = storage.bucket(process.env.GCP_BUCKET_NAME)

export async function uploadImages(files: { fileName: string; contentType: string }[]) {
  const signedUrls = await Promise.all(
    files.map(async ({ fileName, contentType }) => {
      // give unique names to files
      const extension = path.extname(fileName).toLowerCase()
      const newFileName = uuid() + extension
      const options: GetSignedUrlConfig = {
        version: 'v4',
        action: 'write',
        expires: Date.now() + 15 * 60 * 1000, // 15 min
        contentType,
      }
      const cloudFile = bucket.file(newFileName)
      // generate signed URL for each file
      const [signedUrl] = await cloudFile.getSignedUrl(options)
      return {
        signed: signedUrl,
        public: cloudFile.publicUrl(),
      }
    }),
  )
  return signedUrls
}

// delete file from google cloud storage
export async function deleteImage(url?: string) {
  if (!url) throw new Error('Unknown image file')
  const file = bucket.file(url)
  await file.delete()
}
