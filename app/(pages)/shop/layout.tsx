'use client'

import type { PropsWithChildren } from 'react'
import { useEffect } from 'react'
import { useCheckoutFormStore } from './stores/checkout-form-store'
import { useShopCartStore } from './stores/shop-cart-store'

/**
 * Shop layout with hydration for the persisted cart and checkout-form stores
 */
export default function Layout({ children }: PropsWithChildren) {
  // Hydrate persisted stores on mount (both use skipHydration)
  useEffect(() => {
    useShopCartStore.persist.rehydrate()
    useCheckoutFormStore.persist.rehydrate()
  }, [])

  return <>{children}</>
}
