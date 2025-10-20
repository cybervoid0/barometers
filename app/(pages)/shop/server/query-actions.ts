'use server'

import type { ActionResult, ProductWithImages } from '@/types'
import { getProductsByIds } from './queries'

async function fetchProductsByIds(
  productIds: string[],
): Promise<ActionResult<ProductWithImages[]>> {
  try {
    return {
      success: true,
      data: await getProductsByIds(productIds),
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unable to fetch products',
    }
  }
}

export { fetchProductsByIds }
