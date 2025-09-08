import 'server-only'

import type { Prisma } from '@prisma/client'
import { DEFAULT_PAGE_SIZE } from '@/constants'
import { withPrisma } from '@/prisma/prismaClient'
import type { SortValue } from '@/types'

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
const getBarometersByParams = withPrisma(
  async (
    prisma,
    categoryName: string | null,
    page: number,
    size: number,
    sortBy: SortValue | null,
  ) => {
    const pageNo = Math.max(page || 1, 1)
    const pageSize = Math.max(size ?? DEFAULT_PAGE_SIZE, 0)
    // perform case-insensitive compare with the stored categories
    const category = categoryName
      ? await prisma.category.findFirst({
          where: { name: { equals: categoryName, mode: 'insensitive' } },
        })
      : null

    const skip = pageSize ? (pageNo - 1) * pageSize : undefined
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
            select: {
              url: true,
              order: true,
              blurData: true,
            },
            orderBy: {
              order: 'asc',
            },
          },
        },
        skip,
        take: pageSize || undefined,
        orderBy: [getSortCriteria(sortBy), { name: 'asc' }],
      }),
      prisma.barometer.count({ where }),
    ])

    return {
      barometers,
      // if page size is 0 the DB returns all records in one page
      page: pageSize ? pageNo : 1,
      totalPages: pageSize ? Math.ceil(totalItems / pageSize) : 1,
      totalItems,
      pageSize,
    }
  },
)

/**
 * Find barometer by slug
 */
const getBarometer = withPrisma(async (prisma, slug: string) => {
  return prisma.barometer.findFirst({
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
})

type BarometerDTO = Awaited<ReturnType<typeof getBarometer>>
type BarometerListDTO = Awaited<ReturnType<typeof getBarometersByParams>>

export { type BarometerDTO, type BarometerListDTO, getBarometer, getBarometersByParams }
