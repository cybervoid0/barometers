import 'server-only'

import Link from 'next/link'
import { connection } from 'next/server'
import { getProducts } from '@/app/(pages)/shop/server/queries'
import { Image, IsAdmin, ShowMore } from '@/components/elements'
import { Button } from '@/components/ui'
import { formatPrice } from '@/utils/currency'
import { StockStatus } from './components/stock-status'
import { EditProduct } from './edit-product'

/**
 * Get EUR price range from variants
 */
function getPriceRange(
  variants: Array<{ priceEUR: number | null }>,
): { min: number; max: number } | null {
  const prices = variants.map(v => v.priceEUR).filter((p): p is number => p !== null)

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
function formatPriceRange(range: { min: number; max: number } | null): string {
  if (!range) return '—'
  if (range.min === range.max) {
    return formatPrice(range.min)
  }
  return `${formatPrice(range.min)} – ${formatPrice(range.max)}`
}

export default async function ShopPage() {
  await connection()
  const products = await getProducts()

  return (
    <div className="container mx-auto py-8">
      <header className="mb-8 max-w-3xl">
        <h2 className="text-secondary tracking-tight">Shop</h2>
        <ShowMore maxHeight={120} className="mt-3">
          <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
            <p>Welcome to the Barometers.info Shop.</p>
            <p>
              Here you will find a carefully curated selection of books, exclusive merchandise, and
              unusual barometer-related curiosities inspired by the history of weather instruments.
              Some items have been created especially for collectors and enthusiasts, while others
              are simply meant to bring a smile to those who share a passion for scientific
              heritage.
            </p>
            <p>
              Every purchase directly supports The Art of Weather Instruments Foundation. All
              proceeds are transferred to the Foundation and are used to preserve, restore,
              research, document, and share the history of weather instruments with the public.
            </p>
            <p>
              Thank you for helping to preserve this remarkable scientific and cultural heritage.
            </p>
          </div>
        </ShowMore>
      </header>
      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No products available yet.</p>
          <Link href="/admin/add-product">Add your first product</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => {
            const image = product.images.at(0)
            const priceRangeEUR = getPriceRange(product.variants)
            const totalStock = getTotalStock(product.variants)
            const variantCount = product.variants.length

            return (
              <div
                key={product.id}
                className="relative flex h-full flex-col border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <IsAdmin>
                  <EditProduct product={product} />
                </IsAdmin>
                <Link
                  href={`/shop/${product.slug}`}
                  className="relative aspect-square bg-muted flex items-center justify-center bg-card-gradient"
                >
                  {image ? (
                    <Image
                      src={image.url}
                      alt={image.name || product.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="text-muted-foreground">No image</div>
                  )}
                </Link>

                <div className="flex flex-1 flex-col p-4">
                  <h2 className="text-xl font-semibold mb-2">{product.name}</h2>

                  {product.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                      {product.description}
                    </p>
                  )}

                  {/* Pinned to the bottom so the price row + button align across
                      cards of differing content height (e.g. variant counts). */}
                  <div className="mt-auto">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-lg font-bold">{formatPriceRange(priceRangeEUR)}</div>
                      </div>

                      <div className="text-right text-sm text-muted-foreground">
                        <StockStatus inStock={totalStock > 0} />
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
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
