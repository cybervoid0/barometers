import { createStore } from 'zustand'

import { persist } from 'zustand/middleware'

type StateOperationReturn = { success: true } | { success: false; error: string }
interface CartState {
  /** product ID => quantity */
  items: Record<string, number>
}
interface CartStateActions {
  addItem: (productId: string, stock: number, quantity?: number) => StateOperationReturn
  subtractItem: (productId: string, quantity?: number) => StateOperationReturn
  removeItem: (productId: string) => StateOperationReturn
  clearCart: () => void
  getTotalItems: () => number
  getProductAmount: (id: string) => number
}

type CartStore = CartState & CartStateActions

const defaultCartState: CartState = {
  items: {},
}

const createCartStore = () =>
  createStore<CartStore>()(
    persist(
      (set, get) => ({
        ...defaultCartState,
        addItem: (productId, stock, quantity = 1) => {
          const items = get().items
          const newQuantity = (items[productId] ?? 0) + quantity
          if (newQuantity > stock) return { success: false, error: 'Not enough items in stock' }
          set({
            items: { ...items, [productId]: newQuantity },
          })
          return { success: true }
        },

        subtractItem: (productId, quantity = 1) => {
          const items = get().items
          if (!(productId in items)) {
            return { success: false, error: 'Subtracting from unknown product' }
          }
          const newQuantity = (items[productId] ?? 0) - quantity
          set({
            items: { ...items, [productId]: newQuantity <= 0 ? 0 : newQuantity },
          })
          return { success: true }
        },

        removeItem: productId => {
          const items = get().items
          if (!(productId in items)) return { success: false, error: 'Unknown product' }
          const { [productId]: _, ...rest } = items
          set({ items: rest })
          return { success: true }
        },

        clearCart: () => set({ items: {} }),

        getTotalItems: () => Object.values(get().items).reduce((sum, item) => sum + item, 0),

        getProductAmount: id => get().items[id] ?? 0,
      }),
      { name: 'cart-storage', skipHydration: true },
    ),
  )

export type { CartState, CartStateActions, CartStore }
export { defaultCartState, createCartStore }
