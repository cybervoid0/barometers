import { withPrisma } from '@/prisma/prismaClient'

export const getCategory = withPrisma((prisma, name: string) =>
  prisma.category.findFirstOrThrow({
    where: {
      name: {
        equals: name,
        mode: 'insensitive',
      },
    },
    select: {
      id: true,
      name: true,
      description: true,
      order: true,
      label: true,
      image: {
        select: {
          url: true,
        },
      },
    },
  }),
)

export type CategoryDTO = Awaited<ReturnType<typeof getCategory>>
