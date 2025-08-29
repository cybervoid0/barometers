'use server'

import type { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { FrontRoutes } from '@/constants'
import { withPrisma } from '@/prisma/prismaClient'
import { /*  cleanObject, */ revalidateCategory, trimTrailingSlash } from '@/utils'

const createBarometer = withPrisma(async (prisma, data: Prisma.BarometerCreateInput) => {
  const { materials, images, ...barometerData } = data
  //const barometer = cleanObject(barometerData)
  const { id, categoryId } = await prisma.barometer.create({
    data: {
      ...barometerData,
      ...(images ? { images } : {}),
      ...(materials && Array.isArray(materials)
        ? {
            materials: {
              connect: materials.map((materialId: number) => ({ id: materialId })),
            },
          }
        : {}),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })
  await revalidateCategory(prisma, categoryId)
  revalidatePath(trimTrailingSlash(FrontRoutes.NewArrivals)) // regenerate new arrivals page
  return { id }
})

export { createBarometer }
