/**
 * @jest-environment node
 */
import {
  calculateShippingCents,
  getShippingZone,
  SHIPPING_BASE_CENTS,
  SHIPPING_PER_KG_CENTS,
} from '../shop'

describe('getShippingZone', () => {
  it('treats the origin country (NL) as domestic', () => {
    expect(getShippingZone('NL')).toBe('domestic')
  })

  it('treats other EU countries as eu', () => {
    expect(getShippingZone('DE')).toBe('eu')
    expect(getShippingZone('FR')).toBe('eu')
  })

  it('treats non-EU countries as world', () => {
    expect(getShippingZone('US')).toBe('world')
    expect(getShippingZone('JP')).toBe('world')
  })
})

describe('calculateShippingCents', () => {
  // base €4.00 + €2.50/kg, 0.5kg brackets, K: NL 1 / EU 1.5 / World 2
  it('prices a 1kg domestic order (base + 1kg)', () => {
    // 1 × (400 + 1 × 250) = 650
    expect(calculateShippingCents(1000, 'NL')).toBe(650)
  })

  it('applies the EU coefficient', () => {
    // 1.5 × (400 + 1 × 250) = 975
    expect(calculateShippingCents(1000, 'DE')).toBe(975)
  })

  it('applies the world coefficient', () => {
    // 2 × (400 + 1 × 250) = 1300
    expect(calculateShippingCents(1000, 'US')).toBe(1300)
  })

  it('rounds billed weight UP to the next 0.5kg bracket', () => {
    // 1.2kg → billed 1.5kg: 1 × (400 + 1.5 × 250) = 775
    expect(calculateShippingCents(1200, 'NL')).toBe(775)
  })

  it('bills at least one bracket for tiny/zero weight', () => {
    // 100g → billed 0.5kg: 1 × (400 + 0.5 × 250) = 525
    expect(calculateShippingCents(100, 'NL')).toBe(525)
    expect(calculateShippingCents(0, 'NL')).toBe(525)
  })

  it('rounds the final amount up to whole cents (EU half-cent case)', () => {
    // 0.5kg EU: 1.5 × (400 + 0.5 × 250) = 1.5 × 525 = 787.5 → ceil 788
    expect(calculateShippingCents(500, 'DE')).toBe(788)
  })

  it('scales with heavier orders', () => {
    // 2kg domestic: 1 × (400 + 2 × 250) = 900
    expect(calculateShippingCents(2000, 'NL')).toBe(900)
  })

  it('exposes sane base/rate constants', () => {
    expect(SHIPPING_BASE_CENTS).toBeGreaterThan(0)
    expect(SHIPPING_PER_KG_CENTS).toBeGreaterThan(0)
  })
})
