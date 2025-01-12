import { withPrisma } from '@/prisma/prismaClient'

export const getManufacturer = withPrisma((prisma, slug: string) =>
  prisma.manufacturer.findUniqueOrThrow({
    where: {
      slug,
    },
  }),
)

export type ManufacturerDTO = Awaited<ReturnType<typeof getManufacturer>>
