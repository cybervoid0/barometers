import { Prisma } from '@prisma/client'
import { withPrisma } from '@/prisma/prismaClient'

/**
 * Search barometers matching a query
 */
export const searchBarometers = withPrisma(
  async (prisma, query: string, page: number, pageSize: number) => {
    const skip = (page - 1) * pageSize

    const where: Prisma.BarometerWhereInput = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { manufacturer: { name: { contains: query, mode: 'insensitive' } } },
      ],
    }

    const [barometers, totalItems] = await Promise.all([
      prisma.barometer.findMany({
        where,
        select: {
          id: true,
          name: true,
          dateDescription: true,
          slug: true,
          manufacturer: {
            select: {
              name: true,
            },
          },
          category: {
            select: {
              name: true,
            },
          },
          images: {
            orderBy: {
              order: 'asc',
            },
            take: 1,
            select: {
              url: true,
            },
          },
        },
        skip,
        take: pageSize,
      }),
      prisma.barometer.count({
        where,
      }),
    ])

    // replace array of images with the first image
    const barometersWithFirstImage = barometers.map(barometer => {
      const { images, ...restBarometer } = barometer
      return {
        ...restBarometer,
        image: images.at(0),
      }
    })

    return {
      barometers: barometersWithFirstImage,
      totalItems,
      page,
      totalPages: Math.ceil(totalItems / pageSize),
      pageSize,
    }
  },
)

export type SearchResultsDTO = Awaited<ReturnType<typeof searchBarometers>>
