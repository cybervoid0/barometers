'use server'

import path from 'node:path'
import { after } from 'next/server'
import sharp from 'sharp'
import { z } from 'zod'
import { prisma } from '@/prisma/prismaClient'
import { requireAdmin } from '@/server/auth'
import { minioBucket, minioClient } from '@/services/minio'
import { ImageType } from '@/types'
import { mediaFileSchema } from './schemas'
import { saveFileToStorage } from './storage'

const imageTypeSchema = z.enum(ImageType)

async function generateBlurData(imageUrl: string): Promise<string | null> {
  try {
    const imageStream = await minioClient.getObject(minioBucket, imageUrl)
    const chunks: Buffer[] = []
    for await (const chunk of imageStream) {
      chunks.push(chunk)
    }
    const imageBuffer = Buffer.concat(chunks)

    const blurBuffer = await sharp(imageBuffer)
      .resize(64, 64, { fit: 'inside' })
      .blur(1.5)
      .png({
        quality: 60,
        compressionLevel: 6,
        adaptiveFiltering: true,
      })
      .toBuffer()

    return `data:image/png;base64,${blurBuffer.toString('base64')}`
  } catch (error) {
    console.error('Failed to generate blur data for', imageUrl, error)
    return null
  }
}

async function createBlurData(images: { url: string; id: string }[]) {
  await Promise.all(
    images.map(async ({ id, url }) => {
      const blurData = await generateBlurData(url)
      if (blurData) {
        await prisma.image.update({
          where: { id },
          data: { blurData },
        })
      }
    }),
  )
}

export async function createImagesInDb(
  rawImageFiles: unknown,
  rawImageType: unknown,
  rawIdSuffix: unknown,
) {
  await requireAdmin()
  const imageFiles = z.array(mediaFileSchema).parse(rawImageFiles)
  const imageType = imageTypeSchema.parse(rawImageType)
  const idSuffix = z.string().min(1).parse(rawIdSuffix)

  const savedImages = await Promise.all(
    imageFiles.map(async ({ url, name }, order) => ({
      url: await saveImage(url, imageType, idSuffix),
      name,
      order,
    })),
  )
  const images = await prisma.image.createManyAndReturn({
    data: savedImages,
    select: { id: true, url: true },
  })

  after(() => createBlurData(images))

  return images
}

function saveImage(tempUrl: string, type: ImageType, idSuffix: string) {
  if (!tempUrl.startsWith('temp/')) return Promise.resolve(tempUrl)
  const permanentUrl = generatePermanentImageName(tempUrl, type, idSuffix)
  return saveFileToStorage(tempUrl, permanentUrl).then(() => permanentUrl)
}

function generatePermanentImageName(tempUrl: string, type: ImageType, idSuffix: string): string {
  const extension = path.extname(tempUrl)
  const random = crypto.randomUUID().slice(0, 8)
  return `gallery/${type}-${idSuffix}__${random}${extension}`
}
