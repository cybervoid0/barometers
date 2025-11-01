import { notFound } from 'next/navigation'
import { getProductBySlug } from '@/app/(pages)/shop/server/queries'
import { Image } from '@/components/elements'
import { formatPrice } from '@/utils'
import { ContinueShopping } from '../components/continue-shopping'
import { QuantityChange } from '../components/quantity-change'
import { ViewShoppingCart } from '../components/view-shopping-cart'

interface Props {
  params: Promise<{
    slug: string
  }>
}

export default async function ProductDetails({ params }: Props) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()
  return (
    <article className="mt-6">
      <h2 className="text-secondary mb-4">{product.name}</h2>
      {(product.images.length ?? 0) > 0 && (
        <div className="flex gap-4 ье">
          {product.images.map(image => (
            <Image
              width={200}
              height={200}
              key={image.id}
              alt={image.name ?? product.name}
              src={image.url}
            />
          ))}
        </div>
      )}
      <div className="flex gap-2 items-center">
        <p>Price:</p>
        <div className="flex flex-col">
          <p className="text-xl">{formatPrice(product.priceUSD ?? 0, 'USD')}</p>
          <p className="text-xl">{formatPrice(product.priceEUR ?? 0, 'EUR')}</p>
        </div>
      </div>
      <QuantityChange className="mt-4" productId={product.id} stock={product.stock} />
      <div className="mt-4 flex gap-2">
        <ContinueShopping />
        <ViewShoppingCart />
      </div>
    </article>
  )
}
