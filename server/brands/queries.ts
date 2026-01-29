import 'server-only'

import { cacheLife, cacheTag } from 'next/cache'
import { DEFAULT_PAGE_SIZE, Tag } from '@/constants'
import { prisma } from '@/prisma/prismaClient'
import { bufferToBase64Url } from '@/utils'

export async function getAllBrands() {
  'use cache'
  cacheLife('max')
  cacheTag(Tag.brands)

  return prisma.manufacturer.findMany({
    select: {
      name: true,
      firstName: true,
      id: true,
    },
    orderBy: [
      {
        name: 'asc',
      },
      {
        createdAt: 'asc',
      },
    ],
  })
}

export async function getBrands(page?: number, size?: number) {
  'use cache'
  cacheLife('max')
  cacheTag(Tag.brands)

  const pageNo = Math.max(page || 1, 1)
  const pageSize = Math.max(size ?? DEFAULT_PAGE_SIZE, 0)
  const skip = pageSize ? (pageNo - 1) * pageSize : undefined
  const [manufacturers, totalItems] = await Promise.all([
    prisma.manufacturer.findMany({
      orderBy: [
        {
          name: 'asc',
        },
        {
          createdAt: 'asc',
        },
      ],
      skip,
      take: pageSize || undefined,
      include: {
        countries: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        images: {
          select: {
            url: true,
            id: true,
            blurData: true,
            order: true,
            name: true,
          },
        },
        predecessors: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        successors: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        pdfFiles: {
          select: {
            name: true,
            url: true,
            id: true,
          },
        },
      },
    }),
    prisma.manufacturer.count(),
  ])
  return {
    manufacturers: manufacturers.map(({ icon, ...brand }) => ({
      ...brand,
      icon: bufferToBase64Url(icon),
    })),
    page: pageSize ? page : 1,
    totalPages: pageSize ? Math.ceil(totalItems / pageSize) : 1,
    totalItems,
    pageSize,
  }
}

export async function getBrand(slug: string) {
  'use cache'
  cacheLife('max')
  cacheTag(Tag.brands)

  const { icon, ...brand } = await prisma.manufacturer.findUniqueOrThrow({
    where: {
      slug,
    },
    include: {
      predecessors: {
        select: {
          id: true,
          firstName: true,
          name: true,
          slug: true,
        },
      },
      successors: {
        select: {
          id: true,
          firstName: true,
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
      countries: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      pdfFiles: {
        select: {
          name: true,
          url: true,
          id: true,
        },
      },
    },
  })
  return {
    ...brand,
    icon: bufferToBase64Url(icon),
  }
}

export async function getBrandsByCountry() {
  'use cache'
  cacheLife('max')
  cacheTag(Tag.brands)

  const countries = await prisma.country.findMany({
    where: {
      manufacturers: {
        some: {},
      },
    },
    include: {
      _count: {
        select: {
          manufacturers: true,
        },
      },
      manufacturers: {
        orderBy: {
          name: 'asc',
        },
        include: {
          _count: {
            select: {
              barometers: true,
            },
          },
          predecessors: {
            select: {
              id: true,
              firstName: true,
              name: true,
              slug: true,
            },
          },
          successors: {
            select: {
              id: true,
              firstName: true,
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
          countries: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          pdfFiles: {
            select: {
              name: true,
              url: true,
              id: true,
            },
          },
        },
      },
    },
  })
  return countries
    .map(country => {
      return {
        ...country,
        manufacturers: country.manufacturers.map(({ icon, ...brand }) => {
          return {
            ...brand,
            icon: bufferToBase64Url(icon),
          }
        }),
      }
    })
    .sort((a, b) => b._count.manufacturers - a._count.manufacturers)
}

export type BrandDTO = Awaited<ReturnType<typeof getBrand>>

export type BrandListDTO = Awaited<ReturnType<typeof getBrands>>

export type AllBrandsDTO = Awaited<ReturnType<typeof getAllBrands>>

export type BrandsByCountryDTO = Awaited<ReturnType<typeof getBrandsByCountry>>
