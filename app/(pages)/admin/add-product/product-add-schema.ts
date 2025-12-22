import { z } from 'zod'

/**
 * Schema for product option (e.g., Size, Color)
 */
const productOptionSchema = z.object({
  name: z.string().min(1, 'Option name is required'),
  values: z
    .array(z.string().min(1, 'Value cannot be empty'))
    .min(1, 'At least one value is required'),
})

/**
 * Schema for product variant
 */
const productVariantSchema = z.object({
  id: z.string().optional(), // existing variant ID for editing
  sku: z.string().min(1, 'SKU is required'),
  options: z.record(z.string(), z.string()), // { "Size": "A5", "Color": "Red" }
  priceEUR: z
    .string()
    .optional()
    .refine(
      val => {
        if (!val || val === '') return true
        const num = Number.parseFloat(val)
        return !Number.isNaN(num) && num >= 0
      },
      { message: 'Price must be a valid positive number' },
    ),
  priceUSD: z
    .string()
    .optional()
    .refine(
      val => {
        if (!val || val === '') return true
        const num = Number.parseFloat(val)
        return !Number.isNaN(num) && num >= 0
      },
      { message: 'Price must be a valid positive number' },
    ),
  stock: z
    .string()
    .min(1, 'Stock is required')
    .refine(
      val => {
        const num = Number.parseInt(val, 10)
        return !Number.isNaN(num) && num >= 0
      },
      { message: 'Stock must be a valid non-negative integer' },
    ),
  weight: z
    .string()
    .optional()
    .refine(
      val => {
        if (!val || val === '') return true
        const num = Number.parseInt(val, 10)
        return !Number.isNaN(num) && num >= 0
      },
      { message: 'Weight must be a valid non-negative integer' },
    ),
})

/**
 * Image schema
 */
const imageSchema = z.object({
  url: z.string().min(1, 'URL is required'),
  name: z.string(),
})

/**
 * Main product schema with options and variants
 */
export const productSchema = z
  .object({
    name: z.string().min(1, 'Product name is required'),
    description: z.string().optional(),
    images: z.array(imageSchema),
    options: z.array(productOptionSchema),
    variants: z.array(productVariantSchema).min(1, 'At least one variant is required'),
  })
  .refine(
    data => {
      // Every variant must have at least one price
      return data.variants.every(v => v.priceEUR || v.priceUSD)
    },
    {
      message: 'Every variant must have at least one price (EUR or USD)',
      path: ['variants'],
    },
  )

export type ProductFormData = z.infer<typeof productSchema>
export type ProductOptionInput = z.infer<typeof productOptionSchema>
export type ProductVariantInput = z.infer<typeof productVariantSchema>

/**
 * Transform form data to server-ready format
 */
export function transformProductData(data: ProductFormData) {
  return {
    name: data.name,
    description: data.description || undefined,
    images: data.images,
    options: data.options.map((opt, index) => ({
      name: opt.name,
      values: opt.values,
      position: index,
    })),
    variants: data.variants.map(v => ({
      sku: v.sku,
      options: v.options,
      priceEUR: v.priceEUR ? Math.round(Number.parseFloat(v.priceEUR) * 100) : undefined,
      priceUSD: v.priceUSD ? Math.round(Number.parseFloat(v.priceUSD) * 100) : undefined,
      stock: Number.parseInt(v.stock, 10),
      weight: v.weight ? Number.parseInt(v.weight, 10) : undefined,
    })),
  }
}

export type TransformedProductData = ReturnType<typeof transformProductData>
