import sharp from 'sharp'
import { googleStorageImagesFolder } from '@/app/constants'

async function getGoogleStorageImage(imgUrl: string) {
  const url = googleStorageImagesFolder + imgUrl
  const res = await fetch(url)
  return res.arrayBuffer()
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
