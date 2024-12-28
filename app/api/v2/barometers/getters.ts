import { type Prisma } from '@prisma/client'
import { SortValue } from '@/app/types'
import { withPrisma } from '@/prisma/prismaClient'

function getSortCriteria(
  sortBy: SortValue | null,
  direction: 'asc' | 'desc' = 'asc',
): Prisma.BarometerOrderByWithRelationInput {
  switch (sortBy) {
    case 'manufacturer':
      return { manufacturer: { name: direction } }
    case 'name':
      return { name: direction }
    case 'date':
      return { date: direction }
    case 'last-added':
      return { createdAt: 'desc' }
    default:
      return { date: direction }
  }
}

/**
 * Find a list of barometers of a certain category (and other params)
 * Respond with pagination
 */
export const getBarometersByParams = withPrisma(
  async (
    prisma,
    categoryName: string | null,
    page: number,
    pageSize: number,
    sortBy: SortValue | null,
  ) => {
    // perform case-insensitive compare with the stored categories
    const category = categoryName
      ? await prisma.category.findFirst({
          where: { name: { equals: categoryName, mode: 'insensitive' } },
        })
      : null

    const skip = (page - 1) * pageSize
    const where: Prisma.BarometerWhereInput | undefined = category
      ? { categoryId: category.id }
      : undefined

    const [barometers, totalItems] = await Promise.all([
      prisma.barometer.findMany({
        where,
        select: {
          id: true,
          name: true,
          date: true,
          slug: true,
          collectionId: true,
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
            select: {
              url: true,
              order: true,
            },
            orderBy: {
              order: 'asc',
            },
          },
        },
        skip,
        take: pageSize,
        orderBy: [getSortCriteria(sortBy), { name: 'asc' }],
      }),
      prisma.barometer.count({ where }),
    ])

    return {
      barometers,
      page,
      totalItems,
      pageSize,
      totalPages: Math.ceil(totalItems / pageSize),
    }
  },
)

export type BarometerListDTO = Awaited<ReturnType<typeof getBarometersByParams>>
