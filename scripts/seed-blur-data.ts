import dotenv from 'dotenv'
import pLimit from 'p-limit'
import sharp from 'sharp'
import { prisma } from '@/prisma/prismaClient'
import { minioBucket, minioClient } from '@/services/minio'

dotenv.config({ path: '.env.local' })

const limit = pLimit(5)

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of stream) {
    chunks.push(chunk as Buffer)
  }
  return Buffer.concat(chunks)
}

async function generateBlurData(url: string): Promise<string> {
  const stream = await minioClient.getObject(minioBucket, url)
  const buffer = await streamToBuffer(stream)
  const blurBuffer = await sharp(buffer)
    .resize(64, 64, { fit: 'inside' })
    .blur(1.5)
    .png({ quality: 60, compressionLevel: 6, adaptiveFiltering: true })
    .toBuffer()
  return `data:image/png;base64,${blurBuffer.toString('base64')}`
}

async function main() {
  const urlPrefix = process.argv[2]
  const images = await prisma.image.findMany({
    where: {
      blurData: null,
      ...(urlPrefix ? { url: { startsWith: urlPrefix } } : {}),
    },
    select: { id: true, url: true },
  })

  if (images.length === 0) {
    console.log('Nothing to do — no images without blurData found.')
    return
  }

  console.log(`Generating blurData for ${images.length} image(s)...`)

  const results = await Promise.all(
    images.map(({ id, url }) =>
      limit(async () => {
        try {
          const blurData = await generateBlurData(url)
          await prisma.image.update({ where: { id }, data: { blurData } })
          console.log(`  ✓ ${url}`)
          return { url, ok: true as const }
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error)
          console.error(`  ✗ ${url}: ${message}`)
          return { url, ok: false as const, error: message }
        }
      }),
    ),
  )

  const failed = results.filter(r => !r.ok)
  console.log(`\n✅ Done: ${results.length - failed.length}/${results.length}`)
  if (failed.length > 0) process.exit(1)
}

main()
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
