import pLimit from 'p-limit'
import { googleStorageImagesFolder } from './constants'

interface Props {
  src: string
  width: number
  quality: number
}

export default function customImageLoader({ src, width, quality }: Props) {
  const isLocal = !src.startsWith('http')
  const query = new URLSearchParams()

  const imageOptimizationApi = process.env.NEXT_PUBLIC_IMAGE_OPTIMIZATION_URL
  // Your NextJS application URL
  // const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  const minioUrl = `${process.env.NEXT_PUBLIC_MINIO_URL}/${process.env.NEXT_PUBLIC_MINIO_BUCKET}`

  const fullSrc = `${minioUrl}${src}`

  if (width) query.set('width', String(width))
  if (quality) query.set('quality', String(quality))

  if (isLocal && process.env.NODE_ENV === 'development') {
    return src
  }
  if (isLocal) {
    return `${imageOptimizationApi}/image/${fullSrc}?${query.toString()}`
  }
  return `${imageOptimizationApi}/image/${src}?${query.toString()}`
}

const limit = pLimit(10)
const defaultWidths = [256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840]
export async function warmImages(imgUrls: string[], widths = defaultWidths, quantity = 80) {
  await Promise.allSettled(
    imgUrls.flatMap(imgUrl =>
      widths.map(width =>
        limit(async () => {
          const url = `${googleStorageImagesFolder + imgUrl}?${new URLSearchParams({ width: String(width), quantity: String(quantity) })}`
          const res = await fetch(url, { method: 'HEAD' })
          console.log('🚀 ~ warmImages ~ res:', url, res.status, '--->')
        }),
      ),
    ),
  )
}
