'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { createProduct } from '@/app/(pages)/shop/server/actions'
import { Button, FormProvider } from '@/components/ui'
import { type ProductFormData, productSchema, productTransformSchema } from './product-add-schema'
import { ProductForm } from './product-form'

function ProductAddForm() {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
      priceEUR: '',
      priceUSD: '',
      stock: '',
      weight: '',
    },
  })
  const { reset, formState } = form
  const [isPending, startTransition] = useTransition()
  const onSubmit = useCallback(
    (values: ProductFormData) => {
      startTransition(async () => {
        try {
          const transformedData = await productTransformSchema.parseAsync(values)
          const result = await createProduct(transformedData)
          if (!result.success) throw new Error(result.error)
          toast.success(`Product ${result.product?.name} was created`)
          reset()
        } catch (error) {
          console.error('Form submission error:', error)
          toast.error(
            error instanceof Error ? error.message : `Error creating product ${values.name}.`,
          )
        }
      })
    },
    [reset],
  )

  return (
    <FormProvider {...form}>
      <ProductForm onSubmit={onSubmit}>
        <div className="flex items-center justify-between pt-4">
          <Button type="submit" disabled={isPending || !formState.isValid} className="w-full">
            {isPending ? 'Creating...' : 'Create Product'}
          </Button>
        </div>
      </ProductForm>
      <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <h3 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">Note:</h3>
        <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
          <li>• Prices should be entered as decimal numbers (e.g., 19.99)</li>
          <li>• They will be stored in cents in the database</li>
          <li>• Weight is in grams for shipping calculations</li>
          <li>• Product will be created in Stripe automatically</li>
          <li>• At least one price (EUR or USD) must be provided</li>
        </ul>
      </div>
    </FormProvider>
  )
}

export { ProductAddForm }
