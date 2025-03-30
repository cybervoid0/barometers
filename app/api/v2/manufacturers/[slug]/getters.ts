import { withPrisma } from '@/prisma/prismaClient'

export const getManufacturer = withPrisma((prisma, slug: string) =>
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
    },
  }),
)

export type ManufacturerDTO = Awaited<ReturnType<typeof getManufacturer>>
