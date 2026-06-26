import { notFound } from 'next/navigation'
import { getProductBySlug } from '@/app/(pages)/shop/server/queries'
import { cn } from '@/utils'
import { ContinueShopping } from '../components/continue-shopping'
import { ViewShoppingCart } from '../components/view-shopping-cart'
import { ProductGallery } from './product-gallery'
import { VariantSelector } from './variant-selector'

interface Props {
  params: Promise<{
    slug: string
  }>
}

export default async function ProductDetails({ params }: Props) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const defaultVariant = product.variants[0]
  const hasImages = product.images.length > 0

  return (
    <article className="mt-6 container mx-auto">
      <div className={cn('grid grid-cols-1 gap-8', hasImages && 'md:grid-cols-2 md:gap-10')}>
        {/* Gallery */}
        {hasImages && <ProductGallery images={product.images} productName={product.name} />}

        {/* Details */}
        <div className="space-y-6">
          <h2 className="text-secondary text-3xl font-bold">{product.name}</h2>

          {product.description && <p className="text-muted-foreground">{product.description}</p>}

          {/* Variant selector handles price, availability, options and add to cart */}
          <VariantSelector
            product={product}
            variants={product.variants}
            options={product.options}
            defaultVariantId={defaultVariant?.id}
          />

          <div className="flex gap-2 pt-2">
            <ContinueShopping />
            <ViewShoppingCart />
          </div>
        </div>
      </div>
    </article>
  )
}
