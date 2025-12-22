import { notFound } from 'next/navigation'
import { getProductBySlug } from '@/app/(pages)/shop/server/queries'
import { Image } from '@/components/elements'
import { formatPrice } from '@/utils'
import { ContinueShopping } from '../components/continue-shopping'
import { ViewShoppingCart } from '../components/view-shopping-cart'
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

  // Get price range
  const eurPrices = product.variants.map(v => v.priceEUR).filter((p): p is number => p !== null)
  const usdPrices = product.variants.map(v => v.priceUSD).filter((p): p is number => p !== null)

  const minEUR = eurPrices.length > 0 ? Math.min(...eurPrices) : null
  const maxEUR = eurPrices.length > 0 ? Math.max(...eurPrices) : null
  const minUSD = usdPrices.length > 0 ? Math.min(...usdPrices) : null
  const maxUSD = usdPrices.length > 0 ? Math.max(...usdPrices) : null

  const formatPriceRange = (min: number | null, max: number | null, currency: 'EUR' | 'USD') => {
    if (min === null || max === null) return null
    if (min === max) return formatPrice(min, currency)
    return `${formatPrice(min, currency)} - ${formatPrice(max, currency)}`
  }

  return (
    <article className="mt-6 container mx-auto">
      <h2 className="text-secondary text-3xl font-bold mb-4">{product.name}</h2>

      {product.images.length > 0 && (
        <div className="flex gap-4 mb-6 flex-wrap">
          {product.images.map(image => (
            <Image
              key={image.id}
              src={image.url}
              alt={image.name ?? product.name}
              width={200}
              height={200}
              className="rounded-lg object-cover w-[200px] h-[200px]"
            />
          ))}
        </div>
      )}

      {product.description && <p className="text-muted-foreground mb-6">{product.description}</p>}

      <div className="flex gap-2 items-center mb-6">
        <p className="text-lg font-medium">Price:</p>
        <div className="flex flex-col">
          {formatPriceRange(minUSD, maxUSD, 'USD') && (
            <p className="text-xl font-bold">{formatPriceRange(minUSD, maxUSD, 'USD')}</p>
          )}
          {formatPriceRange(minEUR, maxEUR, 'EUR') && (
            <p className="text-lg text-muted-foreground">
              {formatPriceRange(minEUR, maxEUR, 'EUR')}
            </p>
          )}
        </div>
      </div>

      {/* Variant selector handles options and add to cart */}
      <VariantSelector
        product={product}
        variants={product.variants}
        options={product.options}
        defaultVariantId={defaultVariant?.id}
      />

      <div className="mt-6 flex gap-2">
        <ContinueShopping />
        <ViewShoppingCart />
      </div>
    </article>
  )
}
