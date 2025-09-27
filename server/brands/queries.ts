import 'server-only'

import { unstable_cache } from 'next/cache'
import { DEFAULT_PAGE_SIZE, Tag } from '@/constants'
import { withPrisma } from '@/prisma/prismaClient'
import { bufferToBase64Url } from '@/utils'

export const getAllBrands = unstable_cache(
  withPrisma(async prisma => {
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
  }),
  ['getAllBrands'],
  { tags: [Tag.brands] },
)

export const getBrands = unstable_cache(
  withPrisma(async (prisma, page?: number, size?: number) => {
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
          countries: true,
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
  }),
  ['getBrands'],
  { tags: [Tag.brands] },
)

export const getBrand = unstable_cache(
  withPrisma(async (prisma, slug: string) => {
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
        images: true,
        countries: true,
      },
    })
    return {
      ...brand,
      icon: bufferToBase64Url(icon),
    }
  }),
  ['getBrand'],
  { tags: [Tag.brands] },
)

export const getBrandsByCountry = unstable_cache(
  withPrisma(async prisma => {
    const countries = await prisma.country.findMany({
      orderBy: {
        name: 'asc',
      },
      where: {
        manufacturers: {
          some: {},
        },
      },
      include: {
        manufacturers: {
          orderBy: {
            name: 'asc',
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
            images: true,
            countries: true,
          },
        },
      },
    })
    return countries.map(country => {
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
  }),
  ['getBrandsByCountry'],
  { tags: [Tag.brands] },
)

export type BrandDTO = Awaited<ReturnType<typeof getBrand>>

export type BrandListDTO = Awaited<ReturnType<typeof getBrands>>

export type AllBrandsDTO = Awaited<ReturnType<typeof getAllBrands>>

export type BrandsByCountryDTO = Awaited<ReturnType<typeof getBrandsByCountry>>
