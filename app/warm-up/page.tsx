import React from 'react'
import Redis from 'ioredis'
import Image from 'next/image'
import { type ImageRecord } from '@/utils/images'
import { imageStorage } from '@/utils/constants'

const redis = new Redis(process.env.REDIS_URL!)
const redisKey = 'ready-to-warm'

export const revalidate = 60 * 60 * 24

/**
 * Page that warms up image variants by rendering them from a Redis list.
 *
 * Reads the `ready-to-warm` key from Redis, parses it as an array of image records,
 * and triggers generation by rendering images with specified width and quality.
 *
 * Uses ISR to cache the page after the first request.
 */
export default async function page() {
  const record = await redis.get(redisKey)
  const images: ImageRecord[] = record ? JSON.parse(record) : []

  return (
    <div>
      {images.map(({ quality, url, width }) => {
        const searchParams = new URLSearchParams({
          width: String(width),
          quality: String(quality),
        })
        const path = `${imageStorage + url}?${searchParams}`
        return <Image unoptimized width={width} height={10} src={path} alt={path} />
      })}
    </div>
  )
}
