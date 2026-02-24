import { productSchema, transformProductData } from '../product-add-schema'

const validVariant = {
  sku: 'TEST-001',
  options: { Size: 'M' },
  priceEUR: '19.99',
  priceUSD: '21.99',
  stock: '10',
  weight: '500',
}

const validProduct = {
  name: 'Test Product',
  description: 'A test product',
  images: [{ url: 'https://example.com/img.jpg', name: 'Test Image' }],
  options: [{ name: 'Size', values: ['S', 'M', 'L'] }],
  variants: [validVariant],
}

describe('productSchema', () => {
  it('accepts a valid product with one variant', () => {
    const result = productSchema.safeParse(validProduct)
    expect(result.success).toBe(true)
  })

  it('rejects product with no variants', () => {
    const result = productSchema.safeParse({ ...validProduct, variants: [] })
    expect(result.success).toBe(false)
  })

  it('rejects variant without any price', () => {
    const result = productSchema.safeParse({
      ...validProduct,
      variants: [{ ...validVariant, priceEUR: '', priceUSD: '' }],
    })
    expect(result.success).toBe(false)
  })

  it('accepts variant with EUR only', () => {
    const result = productSchema.safeParse({
      ...validProduct,
      variants: [{ ...validVariant, priceUSD: '' }],
    })
    expect(result.success).toBe(true)
  })

  it('accepts variant with USD only', () => {
    const result = productSchema.safeParse({
      ...validProduct,
      variants: [{ ...validVariant, priceEUR: '' }],
    })
    expect(result.success).toBe(true)
  })

  it('rejects variant with negative price', () => {
    const result = productSchema.safeParse({
      ...validProduct,
      variants: [{ ...validVariant, priceEUR: '-5' }],
    })
    expect(result.success).toBe(false)
  })

  it('rejects variant with non-numeric price', () => {
    const result = productSchema.safeParse({
      ...validProduct,
      variants: [{ ...validVariant, priceEUR: 'abc' }],
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing product name', () => {
    const result = productSchema.safeParse({ ...validProduct, name: '' })
    expect(result.success).toBe(false)
  })

  it('rejects variant with negative stock', () => {
    const result = productSchema.safeParse({
      ...validProduct,
      variants: [{ ...validVariant, stock: '-1' }],
    })
    expect(result.success).toBe(false)
  })

  it('accepts product with no images', () => {
    const result = productSchema.safeParse({ ...validProduct, images: [] })
    expect(result.success).toBe(true)
  })

  it('accepts product with no options', () => {
    const result = productSchema.safeParse({ ...validProduct, options: [] })
    expect(result.success).toBe(true)
  })
})

describe('transformProductData', () => {
  it('converts prices to cents', () => {
    const parsed = productSchema.parse(validProduct)
    const result = transformProductData(parsed)

    expect(result.variants[0].priceEUR).toBe(1999)
    expect(result.variants[0].priceUSD).toBe(2199)
  })

  it('converts stock and weight to integers', () => {
    const parsed = productSchema.parse(validProduct)
    const result = transformProductData(parsed)

    expect(result.variants[0].stock).toBe(10)
    expect(result.variants[0].weight).toBe(500)
  })

  it('adds position to options', () => {
    const data = {
      ...validProduct,
      options: [
        { name: 'Size', values: ['S', 'M'] },
        { name: 'Color', values: ['Red', 'Blue'] },
      ],
    }
    const parsed = productSchema.parse(data)
    const result = transformProductData(parsed)

    expect(result.options[0].position).toBe(0)
    expect(result.options[1].position).toBe(1)
  })

  it('sets undefined for empty price strings', () => {
    const data = {
      ...validProduct,
      variants: [{ ...validVariant, priceUSD: '' }],
    }
    const parsed = productSchema.parse(data)
    const result = transformProductData(parsed)

    expect(result.variants[0].priceEUR).toBe(1999)
    expect(result.variants[0].priceUSD).toBeUndefined()
  })

  it('sets undefined for empty weight', () => {
    const data = {
      ...validProduct,
      variants: [{ ...validVariant, weight: '' }],
    }
    const parsed = productSchema.parse(data)
    const result = transformProductData(parsed)

    expect(result.variants[0].weight).toBeUndefined()
  })

  it('sets undefined for empty description', () => {
    const data = { ...validProduct, description: '' }
    const parsed = productSchema.parse(data)
    const result = transformProductData(parsed)

    expect(result.description).toBeUndefined()
  })
})
