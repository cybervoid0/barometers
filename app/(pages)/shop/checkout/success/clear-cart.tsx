'use client'

import { useEffect } from 'react'
import { useCheckoutFormStore } from '../../stores/checkout-form-store'
import { useShopCartStore } from '../../stores/shop-cart-store'

export function ClearCartOnMount({ orderStatus }: { orderStatus: string }) {
  useEffect(() => {
    if (orderStatus === 'PAID' || orderStatus === 'PROCESSING') {
      useShopCartStore.getState().clearCart()
      // The order went through — drop the saved checkout draft too.
      useCheckoutFormStore.getState().reset()
    }
  }, [orderStatus])

  return null
}
