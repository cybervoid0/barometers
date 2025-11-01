import { z } from 'zod'
import { saveProductImages } from '@/server/files/images'

export const productSchema = z
  .object({
    name: z.string().min(1, 'Product name is required'),
    description: z.string().optional(),
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
    images: z.array(
      z.object({
        url: z.string().min(1, 'URL is required'),
        name: z.string(),
      }),
    ),
  })
  .refine(
    data => {
      // At least one price must be provided
      return data.priceEUR || data.priceUSD
    },
    {
      message: 'At least one price (EUR or USD) must be provided',
      path: ['priceEUR'],
    },
  )

export type ProductFormData = z.infer<typeof productSchema>

export const productTransformSchema = productSchema.transform(async data => ({
  name: data.name,
  description: data.description || undefined,
  priceEUR: data.priceEUR ? Math.round(Number.parseFloat(data.priceEUR) * 100) : undefined,
  priceUSD: data.priceUSD ? Math.round(Number.parseFloat(data.priceUSD) * 100) : undefined,
  stock: Number.parseInt(data.stock, 10),
  weight: data.weight ? Number.parseInt(data.weight, 10) : undefined,
  images: await saveProductImages(data.images),
}))
