import type { PropsWithChildren } from 'react'

export default function Layout({ children }: PropsWithChildren) {
  return <div className="px-2 sm:px-4">{children}</div>
}
