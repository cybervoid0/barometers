'use client'

import { Minus, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useCartStore } from '@/app/(pages)/shop/providers/CartStoreProvider'
import type { getProductBySlug } from '@/app/(pages)/shop/server/queries'
import { Image } from '@/components/elements'
import { Button } from '@/components/ui'
import { formatPrice } from '@/utils'

interface Props {
  product: NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>
}

export function ProductDetails({ product }: Props) {
  const { addItem, subtractItem } = useCartStore(state => state)
  const amount = useCartStore(state => state.getProductAmount(product.id))

  const handleAddItem = () => {
    const res = addItem(product.id, product.stock)
    if (!res.success) {
      toast.error(res.error, { id: 'add-item-error' })
    }
  }

  const handleSubtractItem = () => {
    const res = subtractItem(product.id, product.stock)
    if (!res.success) {
      toast.error(res.error, { id: 'subtract-item-error' })
    }
  }

  return (
    <>
      {(product.images.length ?? 0) > 0 && (
        <div className="flex gap-4">
          {product.images.map(image => (
            <Image key={image.id} alt={image.alt ?? product.name} src={image.url} />
          ))}
        </div>
      )}
      <p>Price: {formatPrice(product.priceEUR ?? 0, 'EUR')}€</p>
      <p>Amount in cart: {amount}</p>
      <div className="mt-6 ">
        <Button
          className="rounded-none first:rounded-l-md last:rounded-r-md"
          size="sm"
          onClick={handleAddItem}
        >
          <Plus />
        </Button>
        <Button
          className="rounded-none first:rounded-l-md last:rounded-r-md"
          size="sm"
          onClick={handleSubtractItem}
        >
          <Minus />
        </Button>
      </div>
    </>
  )
}
