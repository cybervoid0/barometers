import { type Prisma } from '@prisma/client'
import { SortValue } from '@/app/collection/categories/[category]/types'
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
    case 'cat-no':
      return { collectionId: direction }
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
    categoryName: string,
    page: number,
    pageSize: number,
    sortBy: SortValue | null,
  ) => {
    // perform case-insensitive compare with the stored categories
    const category = await prisma.category.findFirst({
      where: { name: { equals: categoryName, mode: 'insensitive' } },
    })
    if (!category) throw new Error('Unknown barometer category')

    const skip = (page - 1) * pageSize

    const [barometers, totalItems] = await Promise.all([
      prisma.barometer.findMany({
        where: { categoryId: category.id },
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
      prisma.barometer.count({ where: { categoryId: category.id } }),
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

export type ParameterizedBarometerListDTO = Awaited<ReturnType<typeof getBarometersByParams>>

/**
 * List all barometers WITHOUT pagination. This is used in static pages generation
 */
export const getAllBarometers = withPrisma(prisma =>
  prisma.barometer.findMany({
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
    },
  }),
)

export type BarometerListDTO = Awaited<ReturnType<typeof getAllBarometers>>
