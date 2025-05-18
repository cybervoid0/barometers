import Redis from 'ioredis'
import pLimit from 'p-limit'
import * as dotenv from 'dotenv'
import { imageStorage } from './constants.ts'

dotenv.config()
const redis = new Redis(process.env.REDIS_URL!)

const redisKey = 'ready-to-warm'
type Params =
  | {
      widths?: number[]
      quality?: number
    }
  | undefined
const defaultWidths = [256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840]
const defaultQuality = 80
/**
 * Makes sure images are generated and cached ahead of time so users don’t have to wait when they visit the site
 */
interface ImageRecord {
  url: string
  width: number
  quality: number
}
export async function markForWarming(imgUrls: string[], params?: Params) {
  if (process.env.NODE_ENV === 'production') {
    if (redis.status !== 'ready') throw new Error('Redis connection is not ready')
    const widths = params?.widths ?? defaultWidths
    const quality = params?.quality ?? defaultQuality
    const record = await redis.get(redisKey)
    const images: ImageRecord[] = record ? JSON.parse(record) : []
    for (const url of imgUrls) {
      for (const width of widths) {
        images.push({ url, width, quality })
      }
    }
    await redis.set(redisKey, JSON.stringify(images), 'EX', 900) // store for 15 minutes
  }
}

const limit = pLimit(10)
export async function warmImages() {
  try {
    if (process.env.NODE_ENV === 'production') {
      const record = await redis.get(redisKey)
      const images: ImageRecord[] = record ? JSON.parse(record) : []
      for (const { url, width, quality } of images) {
        await limit(async () => {
          const searchParams = new URLSearchParams({
            width: String(width),
            quality: String(quality),
          })
          const path = `${imageStorage + url}?${searchParams}`
          const res = await fetch(path)
          console.log('🚀 ~ caching:', path, res.status)
        })
      }
    }
    await redis.del(redisKey)
  } catch (error) {
    console.error(error)
  }
}
