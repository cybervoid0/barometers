'use client'

import type { PropsWithChildren } from 'react'
import { useEffect } from 'react'
import { useShopCartStore } from './stores/shop-cart-store'

/**
 * Shop layout with hydration for cart store
 */
export default function Layout({ children }: PropsWithChildren) {
  // Hydrate cart store on mount
  useEffect(() => {
    useShopCartStore.persist.rehydrate()
  }, [])

  return <>{children}</>
}
