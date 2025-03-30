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
        include: {
          countries: true,
          successors: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          predecessors: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          images: true,
        },
      },
      images: {
        orderBy: {
          order: 'asc',
        },
      },
      subCategory: true,
      materials: {
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          name: 'asc',
        },
      },
    },
  })
  if (barometer === null) throw new NotFoundError()
  return barometer
})

export type BarometerDTO = Awaited<ReturnType<typeof getBarometer>>
