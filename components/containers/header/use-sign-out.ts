'use client'

import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { useShopCartStore } from '@/app/(pages)/shop/stores/shop-cart-store'

/**
 * Shared sign-out handler for the header menus (desktop + mobile).
 *
 * Centralised so the post-logout cleanup can't drift between the two call
 * sites. Crucially it clears the persisted shop cart: it lives in
 * localStorage, so without this the next person on the same browser would
 * inherit the previous user's cart.
 */
export function useSignOut() {
  const { data: session } = useSession()
  const router = useRouter()

  return async function signOutAndCleanup(onBeforeSignOut?: () => void) {
    const who = session?.user?.email ?? session?.user?.name ?? 'You'
    onBeforeSignOut?.()
    // Clear the persisted cart before anything else so it never survives a logout.
    useShopCartStore.getState().clearCart()
    // redirect:false keeps a client navigation so the toast survives
    // (a full callbackUrl redirect would reload the page and drop it).
    await signOut({ redirect: false })
    toast.success(`${who} signed out`)
    router.push('/')
    router.refresh()
  }
}
