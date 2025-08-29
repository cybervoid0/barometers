import type { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { BAROMETERS_PER_CATEGORY_PAGE } from '@/constants/globals'
import { FrontRoutes } from '@/constants/routes-front'
import { SortOptions } from '@/types'

/**
 * Revalidates the cache for a specific category by recalculating the paths that need to be revalidated.
 * Call this function after adding/updating a barometer to update the category pages that include the
 * barometer.
 *
 * @param prisma - The PrismaClient instance used to interact with the database.
 * @param categoryId - The ID of the category to revalidate.
 */
export async function revalidateCategory(prisma: PrismaClient, categoryId: string) {
  const { name: categoryName } = await prisma.category.findUniqueOrThrow({
    where: { id: categoryId },
    select: { name: true },
  })
  const barometersInCategory = await prisma.barometer.count({ where: { categoryId } })
  const pagesPerCategory = Math.ceil(barometersInCategory / BAROMETERS_PER_CATEGORY_PAGE)
  const pathsToRevalidate = SortOptions.flatMap(({ value: sort }) =>
    Array.from(
      { length: pagesPerCategory },
      (_, i) => `${FrontRoutes.Categories}${[categoryName, sort, String(i + 1)].join('/')}`,
    ),
  )
  for (const path of pathsToRevalidate) {
    revalidatePath(path)
  }
}
