'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { Product, ProductImage, ProductOption, ProductVariant } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  type ProductFormData,
  productSchema,
} from '@/app/(pages)/admin/add-product/product-add-schema'
import { ProductForm } from '@/app/(pages)/admin/add-product/product-form'
import { updateProductWithVariants } from '@/app/(pages)/shop/server/actions'
import { Button, FormProvider } from '@/components/ui'
import { Route } from '@/constants'

type ProductWithRelations = Product & {
  images: ProductImage[]
  options: ProductOption[]
  variants: (ProductVariant & { images?: ProductImage[] })[]
}

interface Props {
  product: ProductWithRelations
}

/**
 * Transform database product to form data format
 */
function productToFormData(product: ProductWithRelations): ProductFormData {
  return {
    name: product.name,
    description: product.description ?? '',
    images: product.images.map(img => ({
      url: img.url,
      name: img.name ?? '',
    })),
    options: product.options.map(opt => ({
      name: opt.name,
      values: opt.values as string[],
    })),
    variants: product.variants.map(v => ({
      id: v.id,
      sku: v.sku,
      options: v.options as Record<string, string>,
      priceEUR: v.priceEUR ? (v.priceEUR / 100).toFixed(2) : '',
      priceUSD: v.priceUSD ? (v.priceUSD / 100).toFixed(2) : '',
      stock: v.stock.toString(),
      weight: v.weight?.toString() ?? '',
    })),
  }
}

function ProductEditForm({ product }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    mode: 'onChange',
    defaultValues: productToFormData(product),
  })

  const { formState } = form

  const onSubmit = useCallback(
    async (values: ProductFormData) => {
      startTransition(async () => {
        try {
          const result = await updateProductWithVariants({
            id: product.id,
            name: values.name,
            description: values.description || undefined,
            images: values.images,
            options: values.options.map((opt, index) => ({
              name: opt.name,
              values: opt.values,
              position: index,
            })),
            variants: values.variants.map(v => ({
              id: (v as { id?: string }).id,
              sku: v.sku,
              options: v.options,
              priceEUR: v.priceEUR ? Math.round(Number.parseFloat(v.priceEUR) * 100) : undefined,
              priceUSD: v.priceUSD ? Math.round(Number.parseFloat(v.priceUSD) * 100) : undefined,
              stock: Number.parseInt(v.stock, 10),
              weight: v.weight ? Number.parseInt(v.weight, 10) : undefined,
            })),
          })

          if (!result.success) {
            throw new Error(result.error)
          }

          toast.success(`Product "${result.product?.name}" was updated successfully`)
          // Redirect outside of transition
          setTimeout(() => router.push(Route.Shop), 0)
        } catch (error) {
          console.error('Form submission error:', error)
          toast.error(
            error instanceof Error ? error.message : `Error updating product ${values.name}.`,
          )
        }
      })
    },
    [product.id, router],
  )

  return (
    <FormProvider {...form}>
      <ProductForm onSubmit={onSubmit}>
        <div className="flex items-center gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending || !formState.isValid} className="flex-1">
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </ProductForm>
    </FormProvider>
  )
}

export { ProductEditForm }
