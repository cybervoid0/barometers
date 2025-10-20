import { z } from 'zod'

export const testCheckoutSchema = z.object({
  userId: z.uuid('Invalid User ID format'),
  productId: z.uuid('Invalid Product ID format'),
  quantity: z
    .string()
    .min(1, 'Quantity is required')
    .refine(
      val => {
        const num = Number.parseInt(val, 10)
        return !Number.isNaN(num) && num > 0
      },
      { message: 'Quantity must be a positive integer' },
    ),
})

export type TestCheckoutFormData = z.infer<typeof testCheckoutSchema>

export const testCheckoutTransformSchema = testCheckoutSchema.transform(data => ({
  userId: data.userId,
  productId: data.productId,
  quantity: Number.parseInt(data.quantity, 10),
}))
