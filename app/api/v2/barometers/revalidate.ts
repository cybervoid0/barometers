import { revalidatePath } from 'next/cache'
import { PrismaClient } from '@prisma/client'
import { SortOptions } from '@/app/types'
import { BAROMETERS_PER_CATEGORY_PAGE } from '@/utils/constants'
import { FrontRoutes } from '@/utils/routes-front'

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
  console.log('🚀 ~ revalidateCategory ~ categoryName:', categoryName)
  const barometersInCategory = await prisma.barometer.count({ where: { categoryId } })
  console.log('🚀 ~ revalidateCategory ~ barometersInCategory:', barometersInCategory)
  const pagesPerCategory = Math.ceil(barometersInCategory / BAROMETERS_PER_CATEGORY_PAGE)
  console.log('🚀 ~ revalidateCategory ~ pagesPerCategory:', pagesPerCategory)
  const pathsToRevalidate = SortOptions.flatMap(({ value: sort }) =>
    Array.from(
      { length: pagesPerCategory },
      (_, i) => `${FrontRoutes.Categories}${[categoryName, sort, String(i + 1)].join('/')}`,
    ),
  )
  console.log('🚀 ~ revalidateCategory ~ pathsToRevalidate:', pathsToRevalidate)
  for (const path of pathsToRevalidate) {
    revalidatePath(path)
    console.log('revalidated', path)
  }
  //await Promise.all(pathsToRevalidate.map(path => revalidatePath(path)))
}
