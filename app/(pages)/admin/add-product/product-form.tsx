'use client'

import type { ReactNode } from 'react'
import { useFormContext } from 'react-hook-form'
import { RequiredFieldMark } from '@/components/elements'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
} from '@/components/ui'
import type { ProductFormData } from './product-add-schema'

interface Props {
  onSubmit: (values: ProductFormData) => void
  children?: ReactNode
}

function ProductForm({ onSubmit, children = null }: Props) {
  const { control, handleSubmit } = useFormContext<ProductFormData>()

  return (
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

      {children}
    </form>
  )
}

export { ProductForm }
