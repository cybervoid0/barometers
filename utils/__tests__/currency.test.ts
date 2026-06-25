import { amountToCents, centsToAmount, formatPrice, parsePriceToCents } from '../currency'

describe('formatPrice', () => {
  it('formats EUR using de-DE locale', () => {
    const result = formatPrice(1999, 'EUR')
    // de-DE formats as "19,99 €" (with non-breaking space)
    expect(result).toContain('19,99')
    expect(result).toContain('€')
  })

  it('defaults to EUR when no currency is given', () => {
    const result = formatPrice(2199)
    expect(result).toContain('21,99')
    expect(result).toContain('€')
  })

  it('formats zero correctly', () => {
    expect(formatPrice(0, 'EUR')).toContain('0,00')
  })

  it('formats large amounts', () => {
    const result = formatPrice(999999, 'EUR')
    expect(result).toContain('9.999,99')
    expect(result).toContain('€')
  })
})

describe('parsePriceToCents', () => {
  it('converts decimal string to cents', () => {
    expect(parsePriceToCents('19.99')).toBe(1999)
  })

  it('converts integer string to cents', () => {
    expect(parsePriceToCents('20')).toBe(2000)
  })

  it('rounds to nearest cent', () => {
    expect(parsePriceToCents('10.999')).toBe(1100)
  })
})

describe('centsToAmount', () => {
  it('converts cents to decimal', () => {
    expect(centsToAmount(1999)).toBe(19.99)
  })

  it('converts zero', () => {
    expect(centsToAmount(0)).toBe(0)
  })
})

describe('amountToCents', () => {
  it('converts decimal to cents', () => {
    expect(amountToCents(19.99)).toBe(1999)
  })

  it('handles floating point precision', () => {
    // 0.1 + 0.2 = 0.30000000000000004 in JS
    expect(amountToCents(0.1 + 0.2)).toBe(30)
  })

  it('converts zero', () => {
    expect(amountToCents(0)).toBe(0)
  })
})
