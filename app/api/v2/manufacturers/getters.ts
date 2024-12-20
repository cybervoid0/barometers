import { PrismaClient } from '@prisma/client'

export async function getManufacturers(prisma: PrismaClient) {
  return prisma.manufacturer.findMany({
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
  })
}
export type ManufacturerListDTO = Awaited<ReturnType<typeof getManufacturers>>
