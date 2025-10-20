'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { createProduct } from '@/app/(pages)/shop/server/actions'
import { RequiredFieldMark } from '@/components/elements'
import {
  Button,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormProvider,
  Input,
  Textarea,
} from '@/components/ui'
import { type ProductFormData, productSchema, productTransformSchema } from './product-add-schema'

function ProductAddForm() {
  const [isPending, startTransition] = useTransition()

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
  const { handleSubmit, reset, control, formState } = form

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
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Product Name <RequiredFieldMark />
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="Barometer T-Shirt" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} rows={4} placeholder="Product description..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="priceEUR"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price EUR (€)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" step="0.01" min="0" placeholder="19.99" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="priceUSD"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price USD ($)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" step="0.01" min="0" placeholder="21.99" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Stock <RequiredFieldMark />
                </FormLabel>
                <FormControl>
                  <Input {...field} type="number" min="0" placeholder="50" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight (grams)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" min="0" placeholder="200" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center justify-between pt-4">
          <Button type="submit" disabled={isPending || !formState.isValid} className="w-full">
            {isPending ? 'Creating...' : 'Create Product'}
          </Button>
        </div>
      </form>

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

export default ProductAddForm
