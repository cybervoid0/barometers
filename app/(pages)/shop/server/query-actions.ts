'use server'

import { z } from 'zod'
import type { ActionResult, ProductVariantWithProduct, ProductWithImages } from '@/types'
import { getOrderByNumberAndEmail, getProductsByIds, getVariantsByIds } from './queries'

const guestOrderLookupSchema = z.object({
  orderNumber: z.string().trim().min(1, 'Order number is required'),
  email: z.email('Invalid email address'),
})

type GuestOrder = NonNullable<Awaited<ReturnType<typeof getOrderByNumberAndEmail>>>

/**
 * Guest order tracking. Returns the order only when the number and email match;
 * a generic "not found" otherwise (never reveals which of the two was wrong).
 */
async function lookupGuestOrder(input: unknown): Promise<ActionResult<GuestOrder>> {
  const parsed = guestOrderLookupSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  try {
    const order = await getOrderByNumberAndEmail(parsed.data.orderNumber, parsed.data.email)
    if (!order) {
      return { success: false, error: 'No order found with that number and email.' }
    }
    return { success: true, data: order }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unable to look up order',
    }
  }
}

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

export { fetchProductsByIds, fetchVariantsByIds, lookupGuestOrder }
