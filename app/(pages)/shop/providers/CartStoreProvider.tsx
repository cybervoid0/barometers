'use client'

import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useStore } from 'zustand'
import { type CartStore, createCartStore } from '../stores/shop-cart-store'

type CartStoreApi = ReturnType<typeof createCartStore>

const CartStoreContext = createContext<CartStoreApi | undefined>(undefined)

const CartStoreProvider = ({ children }: PropsWithChildren) => {
  const storeRef = useRef<CartStoreApi | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  if (storeRef.current === null) {
    storeRef.current = createCartStore()
  }
  useEffect(() => {
    storeRef.current?.persist.rehydrate()
    setIsHydrated(true)
  }, [])
  if (!isHydrated) {
    return null
  }
  return <CartStoreContext.Provider value={storeRef.current}>{children}</CartStoreContext.Provider>
}

const useCartStore = <T,>(selector: (store: CartStore) => T): T => {
  const cartStoreContext = useContext(CartStoreContext)

  if (!cartStoreContext) throw new Error('useCartStore should be used with CartStoreProvider')

  return useStore(cartStoreContext, selector)
}

export type { CartStoreApi }
export { CartStoreProvider, useCartStore }
