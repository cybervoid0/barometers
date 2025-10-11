'use server'

import sharp from 'sharp'
import { minioBucket, minioClient } from '@/services/minio'

/**
 * Generate blur data for an image stored in MinIO
 * @param imageUrl - The image URL relative to the bucket (e.g., "gallery/image.jpg")
 * @returns Base64 encoded blur data or null if failed
 */
export async function generateBlurData(imageUrl: string): Promise<string | null> {
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

/**
 * Generate blur data for multiple images in parallel
 * @param imageUrls - Array of image URLs
 * @returns Array of blur data strings (null for failed images)
 */
export async function generateBlurDataBatch(imageUrls: string[]): Promise<(string | null)[]> {
  return Promise.all(imageUrls.map(url => generateBlurData(url)))
}
