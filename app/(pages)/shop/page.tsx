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
            return (
              <div
                key={product.id}
                className="relative border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <IsAdmin>
                  <EditProduct product={product} />
                </IsAdmin>
                <div className="aspect-square bg-muted flex items-center justify-center relative">
                  {image ? (
                    <Image
                      src={image.url}
                      alt={image.name || product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="text-muted-foreground">No image</div>
                  )}
                </div>

                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2">{product.name}</h2>

                  {product.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      {product.priceEUR && (
                        <div className="text-lg font-bold">
                          {formatPrice(product.priceEUR, 'EUR')}
                        </div>
                      )}
                      {product.priceUSD && (
                        <div className="text-sm text-muted-foreground">
                          {formatPrice(product.priceUSD, 'USD')}
                        </div>
                      )}
                    </div>

                    <div className="text-sm text-muted-foreground">Stock: {product.stock}</div>
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
