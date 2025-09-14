import { withPrisma } from '@/prisma/prismaClient'

const getCategories = withPrisma(async prisma => {
  const categories = await prisma.category.findMany({
    orderBy: {
      order: 'asc',
    },
    select: {
      id: true,
      name: true,
      label: true,
      order: true,
      images: {
        select: {
          url: true,
          blurData: true,
        },
      },
    },
  })
  return categories.map(({ images: [image], ...category }) => ({
    ...category,
    image,
  }))
})

const getCategory = withPrisma(async (prisma, name: string) => {
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

type CategoryDTO = Awaited<ReturnType<typeof getCategory>>
type CategoriesDTO = Awaited<ReturnType<typeof getCategories>>

export { type CategoryDTO, type CategoriesDTO, getCategories, getCategory }
