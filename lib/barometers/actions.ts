'use server'

import type { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { FrontRoutes } from '@/constants'
import { withPrisma } from '@/prisma/prismaClient'
import { revalidateCategory, trimTrailingSlash } from '@/utils'

// Simple function - just creates the barometer with provided data
const createBarometer = withPrisma(async (prisma, data: Prisma.BarometerUncheckedCreateInput) => {
  const { id, categoryId } = await prisma.barometer.create({
    data,
  })
  await revalidateCategory(prisma, categoryId)
  revalidatePath(trimTrailingSlash(FrontRoutes.NewArrivals)) // regenerate new arrivals page
  return { id }
})

export { createBarometer }
