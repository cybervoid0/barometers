'use server'

import { after } from 'next/server'
import { prisma } from '@/prisma/prismaClient'
import { requireAdmin } from '@/server/auth'
import { createBlurData, saveTempImages } from './persist-images'

/**
 * Save uploaded temp images to permanent storage, create standalone `Image` rows,
 * and schedule blur generation. Returns `{ id, url }[]` suitable for a Prisma
 * `connect`. Kept for edit flows that connect images to an existing entity.
 */
export async function createImagesInDb(
  rawImageFiles: unknown,
  rawImageType: unknown,
  rawIdSuffix: unknown,
) {
  await requireAdmin()
  const savedImages = await saveTempImages(rawImageFiles, rawImageType, rawIdSuffix)

  const images = await prisma.image.createManyAndReturn({
    data: savedImages,
    select: { id: true, url: true },
  })

  after(() => createBlurData(images))

  return images
}
