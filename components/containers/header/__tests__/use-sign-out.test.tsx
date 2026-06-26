import { act, renderHook } from '@testing-library/react'
import {
  EMPTY_CHECKOUT_FORM,
  useCheckoutFormStore,
} from '@/app/(pages)/shop/stores/checkout-form-store'
import { useShopCartStore } from '@/app/(pages)/shop/stores/shop-cart-store'
import { useSignOut } from '../use-sign-out'

const mockSignOut = jest.fn()
const mockPush = jest.fn()
const mockRefresh = jest.fn()
const mockToastSuccess = jest.fn()

jest.mock('next-auth/react', () => ({
  signOut: (...args: unknown[]) => mockSignOut(...args),
  useSession: () => ({ data: { user: { email: 'jane@example.com' } } }),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}))

jest.mock('sonner', () => ({
  toast: { success: (...args: unknown[]) => mockToastSuccess(...args) },
}))

beforeEach(() => {
  jest.clearAllMocks()
  mockSignOut.mockResolvedValue(undefined)
  useShopCartStore.setState({ items: [] })
  useCheckoutFormStore.getState().reset()
})

describe('useSignOut', () => {
  it('clears the persisted cart and checkout draft on sign-out', async () => {
    useShopCartStore.getState().addItem({ variantId: 'v1', productId: 'p1', quantity: 2 })
    useCheckoutFormStore.getState().setValues({
      ...EMPTY_CHECKOUT_FORM,
      firstName: 'Jane',
      address: '1 High St',
      email: 'jane@example.com',
    })
    expect(useShopCartStore.getState().items).toHaveLength(1)

    const { result } = renderHook(() => useSignOut())
    await act(async () => {
      await result.current()
    })

    expect(useShopCartStore.getState().items).toEqual([])
    expect(useCheckoutFormStore.getState().values).toEqual(EMPTY_CHECKOUT_FORM)
  })

  it('signs out without redirect so the toast survives', async () => {
    const { result } = renderHook(() => useSignOut())
    await act(async () => {
      await result.current()
    })

    expect(mockSignOut).toHaveBeenCalledWith({ redirect: false })
    expect(mockToastSuccess).toHaveBeenCalledWith('jane@example.com signed out')
    expect(mockPush).toHaveBeenCalledWith('/')
    expect(mockRefresh).toHaveBeenCalled()
  })

  it('runs the onBeforeSignOut callback before clearing and signing out', async () => {
    const order: string[] = []
    mockSignOut.mockImplementation(async () => {
      order.push('signOut')
    })
    useShopCartStore.getState().addItem({ variantId: 'v1', productId: 'p1', quantity: 1 })

    const onBefore = jest.fn(() => {
      order.push('onBefore')
      // cart still present when the callback runs
      expect(useShopCartStore.getState().items).toHaveLength(1)
    })

    const { result } = renderHook(() => useSignOut())
    await act(async () => {
      await result.current(onBefore)
    })

    expect(onBefore).toHaveBeenCalledTimes(1)
    expect(order).toEqual(['onBefore', 'signOut'])
    expect(useShopCartStore.getState().items).toEqual([])
  })
})
