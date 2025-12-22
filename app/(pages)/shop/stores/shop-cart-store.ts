import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartItem {
  variantId: string
  productId: string
  quantity: number
}

interface CartState {
  items: CartItem[]
}

interface CartActions {
  addItem: (item: { variantId: string; productId: string; quantity: number }) => void
  updateQuantity: (variantId: string, quantity: number) => void
  removeItem: (variantId: string) => void
  clearCart: () => void
  getTotalItems: () => number
  getVariantQuantity: (variantId: string) => number
}

type CartStore = CartState & CartActions

const useShopCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: ({ variantId, productId, quantity }) => {
        set(state => {
          const existing = state.items.find(i => i.variantId === variantId)
          if (existing) {
            return {
              items: state.items.map(i =>
                i.variantId === variantId ? { ...i, quantity: i.quantity + quantity } : i,
              ),
            }
          }
          return {
            items: [...state.items, { variantId, productId, quantity }],
          }
        })
      },

      updateQuantity: (variantId, quantity) => {
        set(state => {
          if (quantity <= 0) {
            return { items: state.items.filter(i => i.variantId !== variantId) }
          }
          return {
            items: state.items.map(i => (i.variantId === variantId ? { ...i, quantity } : i)),
          }
        })
      },

      removeItem: variantId => {
        set(state => ({
          items: state.items.filter(i => i.variantId !== variantId),
        }))
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      getVariantQuantity: variantId => {
        const item = get().items.find(i => i.variantId === variantId)
        return item?.quantity ?? 0
      },
    }),
    {
      name: 'barometers-cart',
      skipHydration: true,
    },
  ),
)

export { useShopCartStore }
export type { CartItem, CartState, CartActions, CartStore }
