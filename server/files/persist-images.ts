import path from 'node:path'
import sharp from 'sharp'
import { z } from 'zod'
import { prisma } from '@/prisma/prismaClient'
import { minioBucket, minioClient } from '@/services/minio'
import { ImageType } from '@/types'
import { mediaFileSchema } from './schemas'
import { saveFileToStorage } from './storage'

const imageTypeSchema = z.enum(ImageType)

export interface PersistedImage {
  url: string
  name: string
  order: number
}

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

/** Generate and persist blur placeholders for the given images. Run via `after()`. */
export async function createBlurData(images: { url: string; id: string }[]) {
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

function generatePermanentImageName(tempUrl: string, type: ImageType, idSuffix: string): string {
  const extension = path.extname(tempUrl)
  const random = crypto.randomUUID().slice(0, 8)
  return `gallery/${type}-${idSuffix}__${random}${extension}`
}

function saveImage(tempUrl: string, type: ImageType, idSuffix: string) {
  if (!tempUrl.startsWith('temp/')) return Promise.resolve(tempUrl)
  const permanentUrl = generatePermanentImageName(tempUrl, type, idSuffix)
  return saveFileToStorage(tempUrl, permanentUrl).then(() => permanentUrl)
}

/**
 * Move uploaded temp objects to their permanent storage location and return rows
 * ready for a nested Prisma `create`. No DB writes and no auth happen here — this
 * is a server-internal helper invoked from already-authorized server actions.
 */
export async function saveTempImages(
  rawImageFiles: unknown,
  rawImageType: unknown,
  rawIdSuffix: unknown,
): Promise<PersistedImage[]> {
  const imageFiles = z.array(mediaFileSchema).parse(rawImageFiles)
  const imageType = imageTypeSchema.parse(rawImageType)
  const idSuffix = z.string().min(1).parse(rawIdSuffix)

  return Promise.all(
    imageFiles.map(async ({ url, name }, order) => ({
      url: await saveImage(url, imageType, idSuffix),
      name,
      order,
    })),
  )
}
