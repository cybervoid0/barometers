import { useShopCartStore } from '../shop-cart-store'

// Reset store state before each test
beforeEach(() => {
  useShopCartStore.setState({ items: [] })
})

describe('shop cart store', () => {
  describe('addItem', () => {
    it('adds a new item to empty cart', () => {
      const store = useShopCartStore.getState()
      store.addItem({ variantId: 'v1', productId: 'p1', quantity: 2 })

      const { items } = useShopCartStore.getState()
      expect(items).toHaveLength(1)
      expect(items[0]).toEqual({ variantId: 'v1', productId: 'p1', quantity: 2 })
    })

    it('sums quantity when adding existing variantId', () => {
      const store = useShopCartStore.getState()
      store.addItem({ variantId: 'v1', productId: 'p1', quantity: 2 })
      store.addItem({ variantId: 'v1', productId: 'p1', quantity: 3 })

      const { items } = useShopCartStore.getState()
      expect(items).toHaveLength(1)
      expect(items[0].quantity).toBe(5)
    })

    it('keeps separate entries for different variants', () => {
      const store = useShopCartStore.getState()
      store.addItem({ variantId: 'v1', productId: 'p1', quantity: 1 })
      store.addItem({ variantId: 'v2', productId: 'p1', quantity: 3 })

      const { items } = useShopCartStore.getState()
      expect(items).toHaveLength(2)
      expect(items[0].variantId).toBe('v1')
      expect(items[1].variantId).toBe('v2')
    })
  })

  describe('updateQuantity', () => {
    it('updates quantity to a positive number', () => {
      const store = useShopCartStore.getState()
      store.addItem({ variantId: 'v1', productId: 'p1', quantity: 1 })
      store.updateQuantity('v1', 5)

      const { items } = useShopCartStore.getState()
      expect(items[0].quantity).toBe(5)
    })

    it('removes item when quantity is zero', () => {
      const store = useShopCartStore.getState()
      store.addItem({ variantId: 'v1', productId: 'p1', quantity: 3 })
      store.updateQuantity('v1', 0)

      const { items } = useShopCartStore.getState()
      expect(items).toHaveLength(0)
    })

    it('removes item when quantity is negative', () => {
      const store = useShopCartStore.getState()
      store.addItem({ variantId: 'v1', productId: 'p1', quantity: 3 })
      store.updateQuantity('v1', -1)

      const { items } = useShopCartStore.getState()
      expect(items).toHaveLength(0)
    })
  })

  describe('removeItem', () => {
    it('removes item by variantId', () => {
      const store = useShopCartStore.getState()
      store.addItem({ variantId: 'v1', productId: 'p1', quantity: 1 })
      store.addItem({ variantId: 'v2', productId: 'p1', quantity: 2 })
      store.removeItem('v1')

      const { items } = useShopCartStore.getState()
      expect(items).toHaveLength(1)
      expect(items[0].variantId).toBe('v2')
    })
  })

  describe('clearCart', () => {
    it('removes all items', () => {
      const store = useShopCartStore.getState()
      store.addItem({ variantId: 'v1', productId: 'p1', quantity: 1 })
      store.addItem({ variantId: 'v2', productId: 'p2', quantity: 2 })
      store.clearCart()

      const { items } = useShopCartStore.getState()
      expect(items).toHaveLength(0)
    })
  })

  describe('getTotalItems', () => {
    it('returns sum of all quantities', () => {
      const store = useShopCartStore.getState()
      store.addItem({ variantId: 'v1', productId: 'p1', quantity: 2 })
      store.addItem({ variantId: 'v2', productId: 'p2', quantity: 3 })

      expect(useShopCartStore.getState().getTotalItems()).toBe(5)
    })

    it('returns 0 for empty cart', () => {
      expect(useShopCartStore.getState().getTotalItems()).toBe(0)
    })
  })

  describe('getVariantQuantity', () => {
    it('returns quantity for existing variant', () => {
      const store = useShopCartStore.getState()
      store.addItem({ variantId: 'v1', productId: 'p1', quantity: 7 })

      expect(useShopCartStore.getState().getVariantQuantity('v1')).toBe(7)
    })

    it('returns 0 for missing variant', () => {
      expect(useShopCartStore.getState().getVariantQuantity('nonexistent')).toBe(0)
    })
  })
})
