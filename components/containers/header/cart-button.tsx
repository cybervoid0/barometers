'use client'

import { ShoppingCart } from 'lucide-react'
import { motion, useAnimationControls } from 'motion/react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
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
  useEffect(() => {
    // The cart store uses `skipHydration`, and the shop layout only rehydrates
    // it under `/shop`. This button is global, so rehydrate here too — otherwise
    // a fresh load of any non-shop page would always see an empty cart.
    void useShopCartStore.persist.rehydrate()
    setMounted(true)
  }, [])

  const count = items.reduce((sum, item) => sum + item.quantity, 0)

  // Pop the badge whenever the total count grows. Imperative controls instead of
  // a `key` remount, which would tear down the element and read as a jitter.
  const badgeControls = useAnimationControls()
  const prevCount = useRef(count)
  useEffect(() => {
    if (count > prevCount.current) {
      void badgeControls.start({
        scale: [1, 1.4, 1],
        transition: { duration: 0.35, ease: 'easeOut' },
      })
    }
    prevCount.current = count
  }, [count, badgeControls])

  if (!mounted || count === 0) return null

  return (
    <Link
      href={Route.Cart}
      aria-label={`Shopping cart, ${count} item${count === 1 ? '' : 's'}`}
      className={cn('relative inline-flex items-center', className)}
    >
      <ShoppingCart size={18} />
      <motion.span
        animate={badgeControls}
        className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-semibold leading-none text-secondary-foreground"
      >
        {count}
      </motion.span>
    </Link>
  )
}
