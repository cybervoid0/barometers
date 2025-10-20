import Image from 'next/image'
import Link from 'next/link'
import { getProducts } from '@/app/(pages)/shop/server/queries'
import { Button } from '@/components/ui'
import { Route } from '@/constants'
import { formatPrice } from '@/utils/currency'

export default async function ShopPage() {
  const products = await getProducts()

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Shop</h1>
      <Link className="block mb-6" href={Route.Cart}>
        <Button>View shopping cart</Button>
      </Link>
      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No products available yet.</p>
          <Link href="/admin/add-product" className="text-blue-600 hover:underline">
            Add your first product
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div
              key={product.id}
              className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
                {product.images.length > 0 ? (
                  <Image
                    src={product.images[0].url}
                    alt={product.images[0].alt || product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="text-gray-400">No image</div>
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
                  <Button variant="contrast" className="w-full">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
