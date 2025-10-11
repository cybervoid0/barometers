'use server'

import path from 'node:path'
import { after } from 'next/server'
import { withPrisma } from '@/prisma/prismaClient'
import { minioBucket, minioClient } from '@/services/minio'
import type { ImageType } from '@/types'
import { generateBlurData } from './blur'

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

function generateImageName(tempUrl: string, type: ImageType, idSuffix: string): string {
  const extension = path.extname(tempUrl)
  const random = crypto.randomUUID().slice(0, 8)
  return `gallery/${type}-${idSuffix}__${random}${extension}`
}

function createTempImage(fileName: string) {
  const tempImageName = `temp/${crypto.randomUUID()}${path.extname(fileName)}`
  return minioClient.presignedPutObject(minioBucket, tempImageName)
}

async function saveTempImage(tempUrl: string, type: ImageType, idSuffix: string) {
  const permanentName = generateImageName(tempUrl, type, idSuffix)
  await minioClient.copyObject(minioBucket, permanentName, `/${minioBucket}/${tempUrl}`)
  await minioClient.removeObject(minioBucket, tempUrl)
  return permanentName
}

/** Costly image processing operations which are executed after the images are stored in the DB */
const createBlurData = withPrisma(
  async (
    prisma,
    images: {
      url: string
      id: string
    }[],
  ) => {
    await Promise.all(
      images.map(async ({ id, url }) => {
        const blurData = await generateBlurData(url)
        if (blurData) {
          await prisma.image.update({
            where: { id },
            data: {
              blurData,
            },
          })
        }
      }),
    )
  },
)

const createImagesInDb = withPrisma(async (prisma, urls: string[], name: string) => {
  const images = await prisma.image.createManyAndReturn({
    data: urls.map((url, order) => ({ url, order, name })),
    select: {
      id: true,
      url: true,
    },
  })

  // attach blur data to created images after return
  after(() => createBlurData(images))

  return images
})

export { deleteImages, deleteImage, createTempImage, saveTempImage, createImagesInDb }
