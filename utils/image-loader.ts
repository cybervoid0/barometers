interface Props {
  src: string
  width: number
  quality: number
}

export default function customImageLoader({ src, width, quality }: Props) {
  const base = process.env.NEXT_PUBLIC_MINIO_URL
  if (!base) throw new Error('Image storage URL is not set')
  const widthValue = width || 512
  const qualityValue = quality || 75
  return `${base}/cdn-cgi/image/width=${widthValue},quality=${qualityValue},format=auto/${process.env.NEXT_PUBLIC_MINIO_BUCKET}/${src}`
}
