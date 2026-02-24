import { checkoutSchema } from '../checkout-schema'

const validData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  address: '123 Main St',
  city: 'Berlin',
  state: 'BE',
  postalCode: '10115',
  country: 'DE',
  currency: 'EUR' as const,
}

describe('checkoutSchema', () => {
  it('accepts valid data', () => {
    const result = checkoutSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('accepts without optional fields', () => {
    const { phone, state, ...required } = validData
    const result = checkoutSchema.safeParse(required)
    expect(result.success).toBe(true)
  })

  it('rejects missing firstName', () => {
    const result = checkoutSchema.safeParse({ ...validData, firstName: '' })
    expect(result.success).toBe(false)
  })

  it('rejects missing lastName', () => {
    const result = checkoutSchema.safeParse({ ...validData, lastName: '' })
    expect(result.success).toBe(false)
  })

  it('rejects missing email', () => {
    const result = checkoutSchema.safeParse({ ...validData, email: '' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid email format', () => {
    const result = checkoutSchema.safeParse({ ...validData, email: 'not-an-email' })
    expect(result.success).toBe(false)
  })

  it('rejects missing country', () => {
    const result = checkoutSchema.safeParse({ ...validData, country: '' })
    expect(result.success).toBe(false)
  })

  it('rejects missing address', () => {
    const result = checkoutSchema.safeParse({ ...validData, address: '' })
    expect(result.success).toBe(false)
  })

  it('rejects missing postalCode', () => {
    const result = checkoutSchema.safeParse({ ...validData, postalCode: '' })
    expect(result.success).toBe(false)
  })

  it('rejects missing city', () => {
    const result = checkoutSchema.safeParse({ ...validData, city: '' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid currency', () => {
    const result = checkoutSchema.safeParse({ ...validData, currency: 'GBP' })
    expect(result.success).toBe(false)
  })

  it('accepts EUR currency', () => {
    const result = checkoutSchema.safeParse({ ...validData, currency: 'EUR' })
    expect(result.success).toBe(true)
  })

  it('accepts USD currency', () => {
    const result = checkoutSchema.safeParse({ ...validData, currency: 'USD' })
    expect(result.success).toBe(true)
  })
})
