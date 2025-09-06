import { DEFAULT_PAGE_SIZE } from '@/constants'
import { withPrisma } from '@/prisma/prismaClient'

export const getAllBrands = withPrisma(async prisma => {
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
})

export const getBrands = withPrisma(async (prisma, page?: number, size?: number) => {
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
    manufacturers,
    page: pageSize ? page : 1,
    totalPages: pageSize ? Math.ceil(totalItems / pageSize) : 1,
    totalItems,
    pageSize,
  }
})

export const getBrand = withPrisma((prisma, slug: string) =>
  prisma.manufacturer.findUniqueOrThrow({
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
  }),
)

export const getBrandsByCountry = withPrisma(async prisma => {
  return prisma.country.findMany({
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
})

export type BrandDTO = Awaited<ReturnType<typeof getBrand>>

export type BrandListDTO = Awaited<ReturnType<typeof getBrands>>

export type AllBrandsDTO = Awaited<ReturnType<typeof getAllBrands>>

export type BrandsByCountryDTO = Awaited<ReturnType<typeof getBrandsByCountry>>
