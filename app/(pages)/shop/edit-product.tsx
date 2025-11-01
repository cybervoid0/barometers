'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { EditButton } from '@/components/elements'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  FormProvider,
} from '@/components/ui'
import type { ProductWithImages } from '@/types'
import { centsToAmount } from '@/utils/currency'
import { type ProductFormData, productSchema, productTransformSchema } from '../admin/add-product'
import { ProductForm } from '../admin/add-product/product-form'
import { updateProduct } from './server/actions'

interface Props {
  product: ProductWithImages
}
function EditProduct({ product }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  })
  const { formState, reset } = form

  useEffect(() => {
    if (!open) return
    reset({
      name: product.name,
      description: product.description ?? '',
      priceUSD: centsToAmount(product.priceUSD ?? 0).toString(),
      priceEUR: centsToAmount(product.priceEUR ?? 0).toString(),
      stock: String(product.stock),
      weight: String(product.weight),
      images: product.images.map(({ url, name }) => ({
        url,
        name: name ?? product.name,
      })),
    })
  }, [open, product, reset])

  const onSubmit = useCallback(
    async (values: ProductFormData) => {
      if (!formState.isDirty) {
        setOpen(false)
        return
      }
      try {
        const transformedData = await productTransformSchema.parseAsync(values)
        const result = await updateProduct(product.id, transformedData)
        if (!result.success) throw new Error(result.error)
        toast.success(`Product ${result.product?.name} was updated`)
        reset()
        setOpen(false)
        router.refresh()
      } catch (error) {
        console.error('Form submission error:', error)
        toast.error(error instanceof Error ? error.message : `Error updating the product`)
      }
    },
    [formState.isDirty, product.id, reset, router],
  )
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="top-0 right-0 absolute z-10 bg-background rounded-bl-lg">
        <EditButton title={`Edit ${product.name}`} />
      </div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>Update the parameters for {product.name}</DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <ProductForm onSubmit={onSubmit}>
            <Button
              type="submit"
              disabled={formState.isLoading || !formState.isValid}
              className="w-full"
            >
              {formState.isLoading ? 'Saving...' : 'Save Product'}
            </Button>
          </ProductForm>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}

export { EditProduct }
