'use client'

import type { AccessRole } from '@prisma/client'
import { ShoppingBag, Trash2, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Image } from '@/components/elements'
import { Button, Separator } from '@/components/ui'
import { Route } from '@/constants'
import type { ProductVariantWithProduct } from '@/types'
import { formatPrice } from '@/utils'
import { ContinueShopping } from '../components/continue-shopping'
import { fetchVariantsByIds } from '../server/query-actions'
import { useShopCartStore } from '../stores/shop-cart-store'

export default function Cart() {
  const router = useRouter()
  const { data: session } = useSession()
  const user = session?.user.name
  const role = session?.user.role

  const { items, updateQuantity, removeItem, clearCart, getTotalItems } = useShopCartStore()

  const [variants, setVariants] = useState<ProductVariantWithProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const variantIds = useMemo(
    () =>
      items
        .map(i => i.variantId)
        .sort()
        .join(','),
    [items],
  )

  useEffect(() => {
    if (!variantIds) {
      setVariants([])
      return
    }

    setIsLoading(true)
    fetchVariantsByIds(variantIds.split(','))
      .then(result => {
        if (result.success) {
          setVariants(result.data)
        } else {
          toast.error(result.error)
        }
      })
      .finally(() => setIsLoading(false))
  }, [variantIds])

  const totals = useMemo(() => {
    let eur = 0
    let usd = 0

    for (const item of items) {
      const variant = variants.find(v => v.id === item.variantId)
      if (variant) {
        eur += (variant.priceEUR ?? 0) * item.quantity
        usd += (variant.priceUSD ?? 0) * item.quantity
      }
    }

    return { eur, usd }
  }, [items, variants])

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear the cart?')) {
      clearCart()
      toast.success('Cart cleared')
    }
  }

  const handleCheckout = () => {
    if (!session) {
      toast.error('Please sign in to checkout')
      router.push(Route.Signin)
      return
    }
    // TODO: Redirect to checkout page
    toast.info('Checkout coming soon...')
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading cart...</p>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <ShoppingBag className="w-16 h-16 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Your cart is empty</h2>
          <p className="text-muted-foreground">Add some products to get started</p>
          <Link href={Route.Shop}>
            <Button>Browse Shop</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          {user && role && (
            <p className="text-sm text-muted-foreground mt-1">
              Welcome {user}. You are {roleDescriptions[role]}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          onClick={handleClearCart}
          className="text-destructive hover:text-destructive"
        >
          <X className="mr-2 h-4 w-4" />
          Clear Cart
        </Button>
      </div>

      <div className="space-y-6">
        {/* Cart items */}
        <div className="space-y-4">
          {items.map(item => {
            const variant = variants.find(v => v.id === item.variantId)
            if (!variant) return null

            const image = variant.images?.[0] ?? variant.product.images?.[0]
            const optionsLabel = formatVariantOptions(variant.options as Record<string, string>)

            return (
              <div key={item.variantId} className="flex gap-4 p-4 border rounded-lg">
                {/* Image */}
                <Link href={`${Route.Shop}/${variant.product.slug}`} className="shrink-0">
                  {image ? (
                    <Image
                      width={80}
                      height={80}
                      className="rounded object-cover hover:opacity-80 transition-opacity"
                      src={image.url}
                      alt={image.name ?? variant.product.name}
                    />
                  ) : (
                    <div className="w-20 h-20 bg-muted rounded flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`${Route.Shop}/${variant.product.slug}`}>
                    <h3 className="font-medium hover:underline">{variant.product.name}</h3>
                  </Link>
                  {optionsLabel && <p className="text-sm text-muted-foreground">{optionsLabel}</p>}
                  <p className="text-xs text-muted-foreground">SKU: {variant.sku}</p>
                  <div className="mt-1">
                    {variant.priceEUR && (
                      <span className="font-medium">{formatPrice(variant.priceEUR, 'EUR')}</span>
                    )}
                    {variant.priceEUR && variant.priceUSD && ' / '}
                    {variant.priceUSD && (
                      <span className="text-muted-foreground">
                        {formatPrice(variant.priceUSD, 'USD')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={item.quantity >= variant.stock}
                    onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                  >
                    +
                  </Button>
                </div>

                {/* Subtotal */}
                <div className="text-right min-w-[100px]">
                  {variant.priceEUR && (
                    <p className="font-bold">
                      {formatPrice(variant.priceEUR * item.quantity, 'EUR')}
                    </p>
                  )}
                  {variant.priceUSD && (
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(variant.priceUSD * item.quantity, 'USD')}
                    </p>
                  )}
                </div>

                {/* Remove */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    removeItem(item.variantId)
                    toast.success(`${variant.product.name} removed from cart`)
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            )
          })}
        </div>

        <Separator />

        <div className="flex justify-between items-start">
          <ContinueShopping />

          <div className="space-y-3 min-w-[300px]">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total items:</span>
              <span className="font-medium">{getTotalItems()}</span>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold">Total (EUR):</span>
                <span className="text-xl font-bold">{formatPrice(totals.eur, 'EUR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Total (USD):</span>
                <span className="text-xl font-bold">{formatPrice(totals.usd, 'USD')}</span>
              </div>
            </div>

            <Button className="w-full" size="lg" onClick={handleCheckout}>
              Proceed to Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatVariantOptions(options: Record<string, string>): string {
  return Object.entries(options)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ')
}

const roleDescriptions: Record<AccessRole, string> = {
  USER: 'a registered user',
  ADMIN: 'a site administrator',
  OWNER: 'the Creator',
}
