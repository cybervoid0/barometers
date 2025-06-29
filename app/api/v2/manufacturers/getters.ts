import { withPrisma } from '@/prisma/prismaClient'

export const getManufacturers = withPrisma(
  async (prisma, page: number, pageSize: number) => {
    const skip = pageSize ? (page - 1) * pageSize : undefined
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
  },
)

export type ManufacturerListDTO = Awaited<ReturnType<typeof getManufacturers>>
