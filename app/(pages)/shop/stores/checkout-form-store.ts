import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CheckoutFormData } from '../checkout/checkout-schema'

export const EMPTY_CHECKOUT_FORM: CheckoutFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  address2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
}

interface CheckoutFormState {
  values: CheckoutFormData
}

interface CheckoutFormActions {
  setValues: (values: CheckoutFormData) => void
  reset: () => void
}

type CheckoutFormStore = CheckoutFormState & CheckoutFormActions

/**
 * Persists the in-progress checkout form so it survives navigating away from
 * the checkout page and back (e.g. browsing the shop mid-checkout). Mirrors the
 * cart store: `skipHydration` + manual rehydrate in the shop layout to avoid an
 * SSR hydration mismatch. Cleared on successful order and on sign-out (it holds
 * a name/address/email and must not leak to the next user on a shared browser).
 */
const useCheckoutFormStore = create<CheckoutFormStore>()(
  persist(
    set => ({
      values: EMPTY_CHECKOUT_FORM,
      setValues: values => set({ values }),
      reset: () => set({ values: EMPTY_CHECKOUT_FORM }),
    }),
    {
      name: 'barometers-checkout-form',
      skipHydration: true,
    },
  ),
)

export { useCheckoutFormStore }
export type { CheckoutFormState, CheckoutFormActions, CheckoutFormStore }
