import 'server-only'

import Link from 'next/link'
import { getProducts } from '@/app/(pages)/shop/server/queries'
import { Image, IsAdmin } from '@/components/elements'
import { Button } from '@/components/ui'
import type { DynamicOptions } from '@/types'
import { formatPrice } from '@/utils/currency'
import { ViewShoppingCart } from './components/view-shopping-cart'
import { EditProduct } from './edit-product'

export const dynamic: DynamicOptions = 'force-dynamic'

/**
 * Get price range from variants
 */
function getPriceRange(
  variants: Array<{ priceEUR: number | null; priceUSD: number | null }>,
  currency: 'EUR' | 'USD',
): { min: number; max: number } | null {
  const prices = variants
    .map(v => (currency === 'EUR' ? v.priceEUR : v.priceUSD))
    .filter((p): p is number => p !== null)

  if (prices.length === 0) return null

  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  }
}

/**
 * Get total stock from variants
 */
function getTotalStock(variants: Array<{ stock: number }>): number {
  return variants.reduce((sum, v) => sum + v.stock, 0)
}

/**
 * Format price range for display
 */
function formatPriceRange(
  range: { min: number; max: number } | null,
  currency: 'EUR' | 'USD',
): string {
  if (!range) return '—'
  if (range.min === range.max) {
    return formatPrice(range.min, currency)
  }
  return `${formatPrice(range.min, currency)} – ${formatPrice(range.max, currency)}`
}

export default async function ShopPage() {
  const products = await getProducts()

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Shop</h1>
      <ViewShoppingCart className="mb-6" />
      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No products available yet.</p>
          <Link href="/admin/add-product">Add your first product</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => {
            const image = product.images.at(0)
            const priceRangeEUR = getPriceRange(product.variants, 'EUR')
            const priceRangeUSD = getPriceRange(product.variants, 'USD')
            const totalStock = getTotalStock(product.variants)
            const variantCount = product.variants.length

            return (
              <div
                key={product.id}
                className="relative border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <IsAdmin>
                  <EditProduct product={product} />
                </IsAdmin>
                <div className="relative aspect-square bg-muted flex items-center justify-center">
                  {image ? (
                    <Image
                      src={image.url}
                      alt={image.name || product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="text-muted-foreground">No image</div>
                  )}
                </div>

                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2">{product.name}</h2>

                  {product.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-lg font-bold">
                        {formatPriceRange(priceRangeEUR, 'EUR')}
                      </div>
                      {priceRangeUSD && (
                        <div className="text-sm text-muted-foreground">
                          {formatPriceRange(priceRangeUSD, 'USD')}
                        </div>
                      )}
                    </div>

                    <div className="text-right text-sm text-muted-foreground">
                      <div>Stock: {totalStock}</div>
                      {variantCount > 1 && <div>{variantCount} variants</div>}
                    </div>
                  </div>

                  <Link href={`/shop/${product.slug}`} className="block">
                    <Button variant="default" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
