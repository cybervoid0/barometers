import dotenv from 'dotenv'
import pLimit from 'p-limit'
import sharp from 'sharp'
import { withPrisma } from '@/prisma/prismaClient'

dotenv.config()
const limit = pLimit(10)

const baseUrl = process.env.NEXT_PUBLIC_MINIO_URL
const bucket = process.env.NEXT_PUBLIC_MINIO_BUCKET

const main = withPrisma(async prisma => {
  const res = await prisma.manufacturer.findMany({
    select: {
      id: true,
      slug: true,
      barometers: {
        take: 1,
        orderBy: {
          date: 'asc',
        },
        select: {
          images: {
            select: {
              url: true,
            },
            orderBy: {
              order: 'asc',
            },
            take: 1,
          },
        },
      },
    },
  })

  const images = res
    .map(brand => ({
      id: brand.id,
      name: brand.slug,
      image: brand.barometers.at(0)?.images.at(0)?.url,
    }))
    .filter(image => image.image)
    .map(image => ({ ...image, image: `${baseUrl}/${bucket}/${image.image}` }))

  // biome-ignore lint/suspicious/noConsole: output in script
  console.log(`Processing ${images.length} brand icons...`)

  const processedImages = await Promise.all(
    images.map(image =>
      limit(async () => {
        try {
          // biome-ignore lint/suspicious/noConsole: output in script
          console.log(`Processing ${image.name}...`)

          const response = await fetch(image.image)
          if (!response.ok) {
            throw new Error(`Failed to fetch ${image.image}: ${response.statusText}`)
          }

          const imgBuffer = Buffer.from(await response.arrayBuffer())

          // Сжимаем изображение до 50x50 с сохранением пропорций + агрессивное сжатие
          const resizedBuffer = await sharp(imgBuffer)
            .resize(50, 50, {
              fit: 'inside', // вписываем изображение целиком
              withoutEnlargement: false, // разрешаем увеличение маленьких изображений
            })
            .png({
              compressionLevel: 9, // максимальное сжатие PNG (0-9)
              quality: 80, // качество 80% (достаточно для иконок)
              palette: true, // используем палитру цветов (меньше размер)
            })
            .toBuffer()

          // Сохраняем в базу данных как Buffer (подходит для типа Bytes)
          await prisma.manufacturer.update({
            where: { id: image.id },
            data: { icon: resizedBuffer },
          })

          // biome-ignore lint/suspicious/noConsole: output in script
          console.log(
            `✓ Saved icon for ${image.name}`,
            `${Math.round(resizedBuffer.length / 1024)}KB`,
          )
          return { name: image.name, success: true }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          console.error(`✗ Failed to process ${image.name}:`, error)
          return { name: image.name, success: false, error: errorMessage }
        }
      }),
    ),
  )

  const successful = processedImages.filter(result => result.success)
  const failed = processedImages.filter(result => !result.success)

  // biome-ignore lint/suspicious/noConsole: output in script
  console.log(`\n✅ Successfully processed: ${successful.length}`)
  // biome-ignore lint/suspicious/noConsole: output in script
  console.log(`❌ Failed: ${failed.length}`)

  if (failed.length > 0) {
    // biome-ignore lint/suspicious/noConsole: output in script
    console.log('\nFailed brands:')
    // biome-ignore lint/suspicious/noConsole: output in script
    failed.forEach(result => console.log(`- ${result.name}: ${result.error}`))
  }
})

main().catch(err => {
  console.error(err)
  process.exit(1)
})
