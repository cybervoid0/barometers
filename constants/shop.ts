import type { OrderStatus } from '@prisma/client'
import { EU_ALPHA2 } from './eu'

// --- Checkout ---

/**
 * How long a Stripe Checkout session (and therefore the stock it reserves) stays
 * alive before Stripe expires it and the `checkout.session.expired` webhook
 * returns the stock. Stripe's minimum is 30 minutes; 60 gives the buyer comfort
 * while still freeing inventory the same hour instead of the 24h default.
 */
export const CHECKOUT_SESSION_TTL_SECONDS = 60 * 60

// --- Shipping ---
// Weight-based model:  cost = ceil( K × (base + billedKg × perKg) )  in cents.
// Tuned to sit near DHL NL retail rates (domestic ~€5–9, EU ~€10–14, world ~€13–18)
// while keeping configuration to a handful of knobs.

/** Country we ship FROM — its own zone (domestic). */
export const SHIPPING_ORIGIN_COUNTRY = 'NL'

/** Flat handling/base fee in cents (packaging + minimum postage), before the zone coefficient. */
export const SHIPPING_BASE_CENTS = 400

/** Per-kilogram rate in cents, before the zone coefficient. */
export const SHIPPING_PER_KG_CENTS = 250

/** Billing weight is rounded UP to this many grams (carrier weight brackets). */
export const SHIPPING_WEIGHT_BRACKET_GRAMS = 500

/** Fallback weight (grams) for a variant with no weight set, so we never undercharge. */
export const DEFAULT_VARIANT_WEIGHT_GRAMS = 500

export type ShippingZone = 'domestic' | 'eu' | 'world'

/** Zone coefficient applied to (base + weight × perKg). */
export const SHIPPING_ZONE_COEFFICIENT: Record<ShippingZone, number> = {
  domestic: 1,
  eu: 1.5,
  world: 2,
}

/** Customer-facing label for each zone (shown as the Stripe shipping option name). */
export const SHIPPING_ZONE_LABEL: Record<ShippingZone, string> = {
  domestic: 'Domestic shipping',
  eu: 'EU shipping',
  world: 'International shipping',
}

/** Map a destination country to its shipping zone (origin country = domestic). */
export function getShippingZone(country: string): ShippingZone {
  if (country === SHIPPING_ORIGIN_COUNTRY) return 'domestic'
  if (EU_ALPHA2.has(country)) return 'eu'
  return 'world'
}

/**
 * Weight-based shipping cost in cents for an order.
 *
 * @param totalWeightGrams summed (variant weight × quantity); callers should
 *   substitute {@link DEFAULT_VARIANT_WEIGHT_GRAMS} for variants without a weight
 * @param country destination country code
 */
export function calculateShippingCents(totalWeightGrams: number, country: string): number {
  // Round billed weight up to whole brackets (at least one).
  const brackets = Math.max(1, Math.ceil(totalWeightGrams / SHIPPING_WEIGHT_BRACKET_GRAMS))
  const billedKg = (brackets * SHIPPING_WEIGHT_BRACKET_GRAMS) / 1000
  const raw = SHIPPING_BASE_CENTS + billedKg * SHIPPING_PER_KG_CENTS
  return Math.ceil(SHIPPING_ZONE_COEFFICIENT[getShippingZone(country)] * raw)
}

export const SHIPPING_COUNTRIES = [
  { code: 'AT', name: 'Austria' },
  { code: 'AU', name: 'Australia' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'CA', name: 'Canada' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'DE', name: 'Germany' },
  { code: 'DK', name: 'Denmark' },
  { code: 'EE', name: 'Estonia' },
  { code: 'ES', name: 'Spain' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'GR', name: 'Greece' },
  { code: 'HR', name: 'Croatia' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IT', name: 'Italy' },
  { code: 'JP', name: 'Japan' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'LV', name: 'Latvia' },
  { code: 'MT', name: 'Malta' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NO', name: 'Norway' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'RO', name: 'Romania' },
  { code: 'RU', name: 'Russia' },
  { code: 'SE', name: 'Sweden' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'US', name: 'United States' },
] as const satisfies { code: string; name: string }[]

export const VALID_ORDER_TRANSITIONS = {
  PENDING: ['PAID', 'CANCELLED'],
  PAID: ['PROCESSING', 'CANCELLED', 'REFUNDED'],
  PROCESSING: ['SHIPPED', 'CANCELLED', 'REFUNDED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
  REFUNDED: [],
} as const satisfies Record<OrderStatus, OrderStatus[]>
