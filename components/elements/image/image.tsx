import NextImage, { type ImageProps } from 'next/image'
import { normalizeLocalPath } from '@/utils'

const exceptions = ['data:', 'http', '//', 'blob:']

function Image({ src, ...props }: ImageProps) {
  // Only normalize local file paths, not data URLs, external URLs, or imported objects
  const shouldNormalize =
    typeof src === 'string' && exceptions.every(prefix => !src.startsWith(prefix))

  const path = shouldNormalize ? normalizeLocalPath(src) : src
  return <NextImage src={path} {...props} />
}
export { Image }
