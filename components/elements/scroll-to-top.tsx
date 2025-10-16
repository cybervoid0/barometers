'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export function ScrollToTop() {
  const pathname = usePathname()

  // biome-ignore lint/correctness/useExhaustiveDependencies: should relaunch on path change
  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
