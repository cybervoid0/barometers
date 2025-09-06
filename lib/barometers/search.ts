import type { Prisma } from '@prisma/client'
import { withPrisma } from '@/prisma/prismaClient'

/**
 * Search barometers matching a query
 */
export const searchBarometers = withPrisma(
  async (prisma, query: string, page: number, pageSize: number) => {
    const skip = pageSize ? (page - 1) * pageSize : undefined

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
              firstName: true,
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
              blurData: true,
            },
          },
        },
        skip,
        take: pageSize || undefined,
        orderBy: {
          createdAt: 'desc',
        },
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
      // if page size is 0 the DB returns all records in one page
      page: pageSize ? page : 1,
      totalPages: pageSize ? Math.ceil(totalItems / pageSize) : 1,
      pageSize,
    }
  },
)

export type SearchResultsDTO = Awaited<ReturnType<typeof searchBarometers>>
