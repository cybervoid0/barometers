import { type PrismaClient } from '@prisma/client'

export async function getBarometer(prisma: PrismaClient, slug: string) {
  const barometer = await prisma.barometer.findFirstOrThrow({
    where: {
      slug: {
        equals: slug,
        mode: 'insensitive',
      },
    },
    include: {
      category: true,
      condition: {
        select: {
          id: true,
          name: true,
          description: true,
          value: true,
        },
      },
      manufacturer: {
        select: {
          id: true,
          city: true,
          name: true,
          country: true,
          description: true,
        },
      },
      images: {
        orderBy: {
          order: 'asc',
        },
      },
    },
  })
  return {
    ...barometer,
    // temporarily
    images: barometer.images.map(img => img.url),
  }
}

export type BarometerDTO = Awaited<ReturnType<typeof getBarometer>>
