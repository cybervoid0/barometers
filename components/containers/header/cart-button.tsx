'use client'

import { ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useShopCartStore } from '@/app/(pages)/shop/stores/shop-cart-store'
import { Route } from '@/constants'
import { cn } from '@/utils'

/**
 * Header cart link. Renders nothing until the cart has at least one item, then
 * shows a cart icon with a count badge. The store is persisted to localStorage,
 * so we gate rendering on mount to avoid a hydration mismatch (SSR sees 0).
 */
export function CartButton({ className }: { className?: string }) {
  const items = useShopCartStore(state => state.items)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const count = items.reduce((sum, item) => sum + item.quantity, 0)

  if (!mounted || count === 0) return null

  return (
    <Link
      href={Route.Cart}
      aria-label={`Shopping cart, ${count} item${count === 1 ? '' : 's'}`}
      className={cn('relative inline-flex items-center', className)}
    >
      <ShoppingCart size={18} />
      <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-semibold leading-none text-secondary-foreground">
        {count}
      </span>
    </Link>
  )
}
