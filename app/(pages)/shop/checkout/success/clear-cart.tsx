'use client'

import { useEffect } from 'react'
import { useShopCartStore } from '../../stores/shop-cart-store'

export function ClearCartOnMount({ orderStatus }: { orderStatus: string }) {
  useEffect(() => {
    if (orderStatus === 'PAID' || orderStatus === 'PROCESSING') {
      useShopCartStore.getState().clearCart()
    }
  }, [orderStatus])

  return null
}
