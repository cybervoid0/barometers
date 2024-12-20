import { PrismaClient } from '@prisma/client'

export async function getManufacturer(prisma: PrismaClient, id: string) {
  return prisma.manufacturer.findUnique({
    where: {
      id,
    },
  })
}
export type ManufacturerDTO = Awaited<ReturnType<typeof getManufacturer>>
