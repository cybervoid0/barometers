import { withPrisma } from '@/prisma/prismaClient'

export const getCategory = withPrisma(async (prisma, name: string) => {
  const {
    images: [image],
    ...category
  } = await prisma.category.findFirstOrThrow({
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
      images: {
        select: {
          url: true,
          blurData: true,
        },
      },
    },
  })
  return {
    ...category,
    image,
  }
})

export type CategoryDTO = Awaited<ReturnType<typeof getCategory>>
