import { createStore } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { ActionResult } from '@/types'

interface CartState {
  /** product ID => quantity */
  items: Record<string, number>
}
interface CartStateActions {
  addItem: (productId: string, inStock: number) => ActionResult
  subtractItem: (productId: string) => ActionResult
  removeItem: (productId: string) => ActionResult
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
      immer((set, get) => ({
        ...defaultCartState,
        addItem: (productId, inStock) => {
          const items = get().items
          const newQuantity = (items[productId] ?? 0) + 1

          if (newQuantity > inStock) return { success: false, error: 'Not enough items in stock' }
          set(state => {
            state.items[productId] = newQuantity
          })
          return { success: true }
        },

        subtractItem: productId => {
          const items = get().items
          if (!(productId in items)) {
            return { success: false, error: 'Subtracting from unknown product' }
          }
          set(state => {
            const newQuantity = (state.items[productId] ?? 0) - 1
            if (newQuantity <= 0) {
              delete state.items[productId]
            } else {
              state.items[productId] = newQuantity
            }
          })
          return { success: true }
        },

        removeItem: productId => {
          const items = get().items
          if (!(productId in items)) return { success: false, error: 'Unknown product' }
          set(state => {
            delete state.items[productId]
          })
          return { success: true }
        },

        clearCart: () =>
          set(state => {
            state.items = {}
          }),

        getTotalItems: () => Object.values(get().items).reduce((sum, item) => sum + item, 0),

        getProductAmount: id => get().items[id] ?? 0,
      })),
      { name: 'cart-storage', partialize: state => state.items, skipHydration: true },
    ),
  )

export type { CartState, CartStateActions, CartStore }
export { defaultCartState, createCartStore }
