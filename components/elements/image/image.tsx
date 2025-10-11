import NextImage, { type ImageProps } from 'next/image'
import { normalizeLocalPath } from '@/utils'

const exceptions = ['data:', 'http', '//', 'blob:']

function Image({ src, blurDataURL, placeholder, ...props }: ImageProps) {
  // Only normalize local file paths, not data URLs, external URLs, or imported objects
  const shouldNormalize =
    typeof src === 'string' && exceptions.every(prefix => !src.startsWith(prefix))

  const path = shouldNormalize ? normalizeLocalPath(src) : src

  // don't try to show blur placeholder when it's not generated yet
  const blurProps = blurDataURL && placeholder === 'blur' ? { blurDataURL, placeholder } : {}
  return <NextImage src={path} {...blurProps} {...props} />
}
export { Image }
