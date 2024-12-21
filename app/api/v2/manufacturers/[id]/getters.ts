import { withPrisma } from '@/prisma/prismaClient'

export const getManufacturer = withPrisma((prisma, id: string) =>
  prisma.manufacturer.findUnique({
    where: {
      id,
    },
  }),
)

export type ManufacturerDTO = Awaited<ReturnType<typeof getManufacturer>>
