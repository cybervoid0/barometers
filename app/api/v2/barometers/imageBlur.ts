import sharp from 'sharp'
import bucket from '@/utils/googleStorage'

async function getGoogleStorageImage(imgUrl: string) {
  const file = bucket.file(imgUrl)
  const [buffer] = await file.download()
  return buffer
}

async function getBlurDateBase64(imgUrl: string) {
  const imgContent = await getGoogleStorageImage(imgUrl)
  return sharp(imgContent)
    .resize(32, 32, { fit: 'inside' })
    .flatten({ background: { r: 239, g: 239, b: 239 } })
    .avif()
    .blur(1)
    .toBuffer()
    .then(buffer => `data:image/avif;base64,${buffer.toString('base64')}`)
}

export async function getImagesMeta(
  images: {
    url: string
    order: number
    name: string
  }[],
) {
  return Promise.all(
    images.map(async image => {
      const blurData = await getBlurDateBase64(image.url)
      return {
        ...image,
        blurData,
      }
    }),
  )
}
