import { Storage } from '@google-cloud/storage'
import sharp from 'sharp'
import { withPrisma } from '../prisma/prismaClient'

const decodedPrivateKey = Buffer.from(process.env.GCP_PRIVATE_KEY!, 'base64').toString('utf-8')
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: {
    client_email: process.env.GCP_CLIENT_EMAIL,
    private_key: decodedPrivateKey,
  },
})
const bucket = storage.bucket(process.env.GCP_BUCKET_NAME!)

/**
 * This function processes images stored either locally or in Google Cloud Storage,
 * generates a small blurred placeholder for each image in AVIF format, and updates
 * the database with the generated placeholder. The process is performed in batches
 * to optimize resource usage.
 */
const main = withPrisma(async prisma => {
  const images = await prisma.image.findMany()

  const batchSize = 10
  for (let i = 0; i < images.length; i += batchSize) {
    const batch = images.slice(i, i + batchSize)
    await Promise.all(
      batch.map(async image => {
        try {
          let imgContent: Buffer | ArrayBuffer
          if (image.url.startsWith('/images')) {
            const res = await fetch(`https://www.barometers.info${image.url}`)
            imgContent = await res.arrayBuffer()
          } else {
            const file = bucket.file(image.url)
            ;[imgContent] = await file.download()
          }

          const blurDataURL = await sharp(imgContent)
            .resize(32, 32, { fit: 'inside' })
            .flatten({ background: { r: 239, g: 239, b: 239 } })
            .avif()
            .blur(1)
            .toBuffer()
            .then(buffer => `data:image/avif;base64,${buffer.toString('base64')}`)

          // update DB record
          await prisma.image.update({
            where: { id: image.id },
            data: { blurData: blurDataURL },
          })

          // eslint-disable-next-line no-console
          console.log(`Обработано изображение: ${image.url}`)
        } catch (error) {
          console.error(
            `Ошибка при обработке ${image.url}:`,
            error instanceof Error ? error.message : 'Unable to process image',
          )
        }
      }),
    )
  }
})

main()
