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
