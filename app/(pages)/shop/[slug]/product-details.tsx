'use client'

import { useCartStore } from '@/app/(pages)/shop/providers/CartStoreProvider'
import type { getProductBySlug } from '@/app/(pages)/shop/server/queries'
import { Image } from '@/components/elements'
import { formatPrice } from '@/utils'
import { QuantityChange } from '../components/quantity-change'

interface Props {
  product: NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>
}

export function ProductDetails({ product }: Props) {
  const amount = useCartStore(state => state.getProductAmount(product.id))
  return (
    <>
      {(product.images.length ?? 0) > 0 && (
        <div className="flex gap-4">
          {product.images.map(image => (
            <Image key={image.id} alt={image.alt ?? product.name} src={image.url} />
          ))}
        </div>
      )}
      <p>Price: {formatPrice(product.priceEUR ?? 0, 'EUR')}</p>
      <p>Amount in cart: {amount}</p>
      <QuantityChange productId={product.id} stock={product.stock} />
    </>
  )
}
