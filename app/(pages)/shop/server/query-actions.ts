'use server'

import type { ActionResult, ProductVariantWithProduct, ProductWithImages } from '@/types'
import { getProductsByIds, getVariantsByIds } from './queries'

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

async function fetchVariantsByIds(
  variantIds: string[],
): Promise<ActionResult<ProductVariantWithProduct[]>> {
  try {
    return {
      success: true,
      data: await getVariantsByIds(variantIds),
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unable to fetch variants',
    }
  }
}

export { fetchProductsByIds, fetchVariantsByIds }
