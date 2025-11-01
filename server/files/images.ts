'use server'

import path from 'node:path'
import { after } from 'next/server'
import sharp from 'sharp'
import { withPrisma } from '@/prisma/prismaClient'
import { minioBucket, minioClient } from '@/services/minio'
import type { ImageType, MediaFile } from '@/types'
import { fileSlug } from '@/utils'
import { saveFile } from './actions'

/**
 * Generate blur data for an image stored in MinIO
 * @param imageUrl - The image URL relative to the bucket (e.g., "gallery/image.jpg")
 * @returns Base64 encoded blur data or null if failed
 */
async function generateBlurData(imageUrl: string): Promise<string | null> {
  try {
    // Get image from MinIO
    const imageStream = await minioClient.getObject(minioBucket, imageUrl)
    // Convert stream to buffer
    const chunks: Buffer[] = []
    for await (const chunk of imageStream) {
      chunks.push(chunk)
    }
    const imageBuffer = Buffer.concat(chunks)

    // Generate small blurred thumbnail using Sharp with transparency
    const blurBuffer = await sharp(imageBuffer)
      .resize(64, 64, { fit: 'inside' }) // Larger size for more detail
      .blur(1.5) // Slightly less blur to preserve more detail
      .png({
        quality: 60, // Higher quality for better colors
        compressionLevel: 6, // Less compression for better quality
        adaptiveFiltering: true,
      })
      .toBuffer()

    // Convert to base64
    const base64 = `data:image/png;base64,${blurBuffer.toString('base64')}`

    return base64
  } catch (error) {
    console.error('Failed to generate blur data for', imageUrl, error)
    return null
  }
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

/**
 * Save image files to MinIO storage and create corresponding database records
 */
const createImagesInDb = withPrisma(
  async (prisma, imageFiles: MediaFile[], imageType: ImageType, idSuffix: string) => {
    const savedImages = await saveImages(imageFiles, imageType, idSuffix)
    const images = await prisma.image.createManyAndReturn({
      data: savedImages,
      select: {
        id: true,
        url: true,
      },
    })

    // attach blur data to created images after return
    after(() => createBlurData(images))

    return images
  },
)
function saveImages(imageFiles: MediaFile[], imageType: ImageType, idSuffix: string) {
  return Promise.all(
    imageFiles.map(async ({ url, name }, order) => ({
      url: await saveImage(url, imageType, idSuffix),
      name,
      order,
    })),
  )
}

/**
 * Renames temp image and moves to `gallery` folder in the MinIO storage
 * @param tempUrl temporary random URL in the MinIO `temp` folder
 * @param type specifies image type (manufacturer, barometer, document)
 * @param idSuffix specifies a word for image identification (manuf. slug, barom. ID, etc)
 * different for every image type
 * @returns permanent image URL in `gallery` MinIO folder
 */
async function saveImage(tempUrl: string, type: ImageType, idSuffix: string): Promise<string> {
  if (!tempUrl.startsWith('temp/')) return tempUrl
  const permanentUrl = generatePermanentImageName(tempUrl, type, idSuffix)
  await saveFile(tempUrl, permanentUrl)
  return permanentUrl
}

function getRandomSuffix(): string {
  return crypto.randomUUID().slice(0, 8)
}

function generatePermanentImageName(tempUrl: string, type: ImageType, idSuffix: string): string {
  const extension = path.extname(tempUrl)
  const random = getRandomSuffix()
  return `gallery/${type}-${idSuffix}__${random}${extension}`
}

/******* Handle Product images *******/

function generatePermanentProductImageName(tempUrl: string, name: string): string {
  const extension = path.extname(tempUrl)
  const random = getRandomSuffix()
  return `products/${fileSlug(name)}__${random}${extension}`
}

async function saveProductImage({ url, name }: { url: string; name: string }) {
  const newUrl = generatePermanentProductImageName(url, name)
  await saveFile(url, newUrl)
  return {
    name,
    url: newUrl,
  }
}

/**
 * Give constant names to temp product images and save to MinIO storage
 */
async function saveProductImages(images: { url: string; name: string }[]) {
  if (images.length === 0) return []
  return await Promise.all(images.map(saveProductImage))
}

export { createImagesInDb, saveImage, saveProductImages }
