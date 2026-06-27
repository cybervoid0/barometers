import 'server-only'

import { Package, Plus } from 'lucide-react'
import Link from 'next/link'
import { connection } from 'next/server'
import { getAdminProducts } from '@/app/(pages)/shop/server/queries'
import { Badge, Button } from '@/components/ui'
import { Route } from '@/constants'
import { formatPrice } from '@/utils'

/**
 * EUR price range across a product's (active) variants.
 */
function formatPriceRange(variants: Array<{ priceEUR: number | null }>): string {
  const prices = variants.map(v => v.priceEUR).filter((p): p is number => p !== null)
  if (prices.length === 0) return '—'
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  return min === max ? formatPrice(min) : `${formatPrice(min)} – ${formatPrice(max)}`
}

function totalStock(variants: Array<{ stock: number }>): number {
  return variants.reduce((sum, v) => sum + v.stock, 0)
}

/**
 * Admin products list — every product including hidden ones (soft-deleted
 * products are excluded by the query). This is the only place a hidden product
 * can be found and un-hidden, since the public `/shop` view filters them out.
 */
export default async function AdminProductsPage() {
  await connection()
  const products = await getAdminProducts()

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Manage Products</h1>
        <Link href={Route.AddProduct}>
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Add product
          </Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="py-12 text-center">
          <p className="mb-4 text-muted-foreground">No products yet.</p>
          <Link href={Route.AddProduct} className="underline">
            Add your first product
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 text-left font-semibold">Product</th>
                <th className="p-3 text-left font-semibold">Variants</th>
                <th className="p-3 text-left font-semibold">Stock</th>
                <th className="p-3 text-left font-semibold">Price</th>
                <th className="p-3 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} className="border-t transition-colors hover:bg-muted/30">
                  <td className="p-3">
                    <Link
                      href={`${Route.EditProduct}${product.id}`}
                      className="flex items-center gap-2 font-medium hover:underline"
                    >
                      <Package className="h-4 w-4 shrink-0 text-muted-foreground" />
                      {product.name}
                    </Link>
                  </td>
                  <td className="p-3 text-muted-foreground">{product.variants.length}</td>
                  <td className="p-3 text-muted-foreground">{totalStock(product.variants)}</td>
                  <td className="p-3 text-muted-foreground">
                    {formatPriceRange(product.variants)}
                  </td>
                  <td className="p-3">
                    {product.isActive ? (
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">Hidden</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
