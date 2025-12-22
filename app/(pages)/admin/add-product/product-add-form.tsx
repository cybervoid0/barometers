'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { createProductWithVariants } from '@/app/(pages)/shop/server/actions'
import { Button, FormProvider } from '@/components/ui'
import { Route } from '@/constants'
import { type ProductFormData, productSchema, transformProductData } from './product-add-schema'
import { ProductForm } from './product-form'

function ProductAddForm() {
  const router = useRouter()
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
      images: [],
      options: [],
      variants: [],
    },
  })
  const { reset, formState } = form
  const [isPending, startTransition] = useTransition()

  const onSubmit = useCallback(
    (values: ProductFormData) => {
      startTransition(async () => {
        try {
          const transformedData = transformProductData(values)
          const result = await createProductWithVariants(transformedData)
          if (!result.success) throw new Error(result.error)
          toast.success(
            `Product "${result.product?.name}" was created with ${result.product?.variants.length} variant(s)`,
          )
          reset()
          router.push(Route.Shop)
        } catch (error) {
          console.error('Form submission error:', error)
          toast.error(
            error instanceof Error ? error.message : `Error creating product ${values.name}.`,
          )
        }
      })
    },
    [reset, router],
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
        <h3 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">How to use:</h3>
        <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
          <li>1. Enter product name and description</li>
          <li>2. Add options (e.g., Size, Color) with values (e.g., A5, A4)</li>
          <li>3. Click "Generate Variants" to create all combinations</li>
          <li>4. Fill in prices and stock for each variant</li>
          <li>5. At least one price (EUR or USD) required per variant</li>
        </ul>
      </div>
    </FormProvider>
  )
}

export { ProductAddForm }
