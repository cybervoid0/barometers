import type { PropsWithChildren } from 'react'
import { CartStoreProvider } from '@/app/(pages)/shop/providers/CartStoreProvider'

export default function Layout({ children }: PropsWithChildren) {
  return <CartStoreProvider>{children}</CartStoreProvider>
}
