import { withPrisma } from '@/prisma/prismaClient'

export const getManufacturers = withPrisma(prisma =>
  prisma.manufacturer.findMany({
    select: {
      name: true,
      id: true,
      city: true,
      country: true,
      description: true,
    },
    orderBy: {
      name: 'asc',
    },
  }),
)

export type ManufacturerListDTO = Awaited<ReturnType<typeof getManufacturers>>
