'use server'

import path from 'node:path'
import { v4 as uuid } from 'uuid'
import { minioBucket, minioClient } from '@/services/minio'

type FileProps = { fileName: string; contentType: string }
type UrlProps = { signed: string; public: string }

async function deleteImages(fileNames?: string[]) {
  if (!Array.isArray(fileNames) || fileNames.length === 0) return
  await Promise.all(fileNames.map(deleteImage))
}

async function deleteImage(fileName: string) {
  try {
    await minioClient.removeObject(minioBucket, fileName)
  } catch (error) {
    console.error('Unable to delete image', error)
    // don't mind if it was not possible to delete the file
  }
}

async function createImageUrls(files: FileProps[]) {
  const urls = await Promise.all(
    files.map<Promise<UrlProps>>(async ({ fileName }) => {
      // give unique names to files
      const extension = path.extname(fileName).toLowerCase()
      const newFileName = `gallery/${uuid()}${extension}`
      const signedUrl = await minioClient.presignedPutObject(minioBucket, newFileName)
      return {
        signed: signedUrl,
        public: newFileName,
      }
    }),
  )
  return { urls }
}

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

export { deleteImages, deleteImage, createImageUrls, uploadFileToCloud }
