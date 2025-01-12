import { withPrisma } from '@/prisma/prismaClient'
import { NotFoundError } from '@/app/errors'

export const getBarometer = withPrisma(async (prisma, slug: string) => {
  const barometer = await prisma.barometer.findFirst({
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
          slug: true,
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
  if (barometer === null) throw new NotFoundError()
  return barometer
})

export type BarometerDTO = Awaited<ReturnType<typeof getBarometer>>
