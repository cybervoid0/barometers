'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { Product, ProductImage, ProductOption, ProductVariant } from '@prisma/client'
import { Eye, EyeOff, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  type ProductFormData,
  productSchema,
} from '@/app/(pages)/admin/add-product/product-add-schema'
import { ProductForm } from '@/app/(pages)/admin/add-product/product-form'
import {
  deleteProduct,
  setProductActive,
  updateProductWithVariants,
} from '@/app/(pages)/shop/server/actions'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  FormProvider,
} from '@/components/ui'
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
      priceEUR: v.priceEUR != null ? (v.priceEUR / 100).toFixed(2) : '',
      stock: v.stock.toString(),
      weight: v.weight?.toString() ?? '',
    })),
  }
}

function ProductEditForm({ product }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  // Separate transition for the visibility/delete controls so they show their own
  // pending state independently of the Save button.
  const [isActionPending, startAction] = useTransition()

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
            variants: values.variants.map(v => {
              const id = (v as { id?: string }).id
              // Baseline the server uses to apply stock as a delta (avoids
              // clobbering reservations made while this form was open).
              const originalStock = id
                ? product.variants.find(pv => pv.id === id)?.stock
                : undefined
              return {
                id,
                sku: v.sku,
                options: v.options,
                priceEUR: v.priceEUR ? Math.round(Number.parseFloat(v.priceEUR) * 100) : undefined,
                stock: Number.parseInt(v.stock, 10),
                originalStock,
                weight: v.weight ? Number.parseInt(v.weight, 10) : undefined,
              }
            }),
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
    [product.id, product.variants, router],
  )

  const handleToggleActive = useCallback(() => {
    startAction(async () => {
      const result = await setProductActive(product.id, !product.isActive)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success(
        result.isActive
          ? `"${product.name}" is now visible in the shop`
          : `"${product.name}" is hidden from the shop`,
      )
      router.refresh()
    })
  }, [product.id, product.isActive, product.name, router])

  const handleDelete = useCallback(() => {
    startAction(async () => {
      const result = await deleteProduct(product.id)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success(`"${product.name}" was deleted`)
      // Redirect outside of the transition (the product no longer exists here).
      setTimeout(() => router.push(Route.AdminProducts), 0)
    })
  }, [product.id, product.name, router])

  const controlsDisabled = isPending || isActionPending

  return (
    <div className="space-y-6">
      {/* Visibility + delete controls — separate from Save/Cancel. */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
        <div>
          <p className="font-medium">{product.isActive ? 'Visible in shop' : 'Hidden from shop'}</p>
          <p className="text-sm text-muted-foreground">
            {product.isActive
              ? 'Customers can see and buy this product.'
              : 'This product is hidden from the storefront and cannot be purchased.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleToggleActive}
            disabled={controlsDisabled}
          >
            {product.isActive ? (
              <>
                <EyeOff className="h-4 w-4" />
                Hide from shop
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Show in shop
              </>
            )}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="destructive" disabled={controlsDisabled}>
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete "{product.name}"?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently removes it from the shop and archives it on Stripe. This cannot
                  be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isActionPending}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isActionPending}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

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
    </div>
  )
}

export { ProductEditForm }
