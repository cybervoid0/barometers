import type { Currency } from '@prisma/client'

/**
 * Format price in cents to human-readable string.
 * The shop sells exclusively in EUR, so prices are always rendered with the
 * German (de-DE) locale, e.g. "10,99 €".
 * @param cents - Price in cents
 * @param currency - Currency code (only EUR is supported)
 * @returns Formatted price string (e.g., "10,99 €")
 */
export const formatPrice = (cents: number, currency: Currency = 'EUR'): string => {
  const amount = cents / 100
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Parse price string to cents
 * @param price - Price as string (e.g., "10.99")
 * @returns Price in cents
 */
export const parsePriceToCents = (price: string): number => {
  return Math.round(Number.parseFloat(price) * 100)
}

/**
 * Convert cents to decimal amount
 * @param cents - Price in cents
 * @returns Decimal amount
 */
export const centsToAmount = (cents: number): number => {
  return cents / 100
}

/**
 * Convert decimal amount to cents
 * @param amount - Decimal amount
 * @returns Price in cents
 */
export const amountToCents = (amount: number): number => {
  return Math.round(amount * 100)
}
