import { trimLeadingSlashes } from './text'

interface Props {
  src: string
  width: number
  quality: number
}

export default function customImageLoader({ src, width = 512, quality = 95 }: Props) {
  const base = process.env.NEXT_PUBLIC_MINIO_URL
  const bucket = process.env.NEXT_PUBLIC_MINIO_BUCKET
  if (!base || !bucket) throw new Error('Unknown Minio parameters')
  const isDevelopment = process.env.NODE_ENV === 'development'
  const cleanPath = trimLeadingSlashes(src)
  // Next.js images format
  if (isDevelopment) return `${base}/${bucket}/${cleanPath}`

  // Cloudflare CDN format
  // https://developers.cloudflare.com/images/transform-images/transform-via-url/
  return `${base}/cdn-cgi/image/width=${width},quality=${quality},format=avif/${bucket}/${cleanPath}`
}
