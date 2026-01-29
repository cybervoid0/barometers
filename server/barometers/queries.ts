import 'server-only'

import type { Prisma } from '@prisma/client'
import { cacheLife, cacheTag } from 'next/cache'
import { DEFAULT_PAGE_SIZE, Tag } from '@/constants'
import { prisma } from '@/prisma/prismaClient'
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
export async function getBarometersByParams(
  categoryName: string | null,
  page: number,
  size: number,
  sortBy: SortValue | null,
) {
  'use cache'
  cacheLife('max')
  cacheTag(Tag.barometers)

  const pageNo = Math.max(page, 1)
  const pageSize = Math.max(size ?? DEFAULT_PAGE_SIZE, 1)
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
}

/**
 * Find barometer by slug
 */
export async function getBarometer(slug: string) {
  'use cache'
  cacheLife('max')
  cacheTag(Tag.barometers)

  return prisma.barometer.findFirst({
    where: {
      slug: {
        equals: slug,
        mode: 'insensitive',
      },
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          label: true,
          description: true,
          order: true,
        },
      },
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
          countries: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
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
          images: {
            select: {
              id: true,
              url: true,
              blurData: true,
              name: true,
              order: true,
            },
          },
        },
        omit: {
          icon: true,
        },
      },
      images: {
        orderBy: {
          order: 'asc',
        },
        select: {
          id: true,
          url: true,
          blurData: true,
          name: true,
          order: true,
        },
      },
      subCategory: {
        select: {
          id: true,
          name: true,
        },
      },
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
}

export async function getAllBarometers() {
  'use cache'
  cacheLife('max')
  cacheTag(Tag.barometers)

  return prisma.barometer.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  })
}

export type BarometerDTO = Awaited<ReturnType<typeof getBarometer>>
export type BarometerListDTO = Awaited<ReturnType<typeof getBarometersByParams>>
export type AllBarometersDTO = Awaited<ReturnType<typeof getAllBarometers>>
