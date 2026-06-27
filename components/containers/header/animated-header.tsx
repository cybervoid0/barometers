'use client'

import { animate, motion, useMotionValue, useMotionValueEvent, useScroll } from 'motion/react'
import type { ComponentProps } from 'react'
import { useEffect, useRef } from 'react'
import { useShopCartStore } from '@/app/(pages)/shop/stores/shop-cart-store'
import { cn } from '@/utils'

const HEADER_HEIGHT = 96 // px
const TOP_THRESHOLD = 200 // always show header before this scroll position
const SCROLL_SPEED = 0.5 // scroll speed multiplier (0.5 = half speed, 1 = normal speed)
const CART_PEEK_DURATION = 2500 // ms to keep header pinned after an item is added

export function AnimatedHeader({
  children,
  className,
  ...props
}: ComponentProps<typeof motion.header>) {
  const { scrollY } = useScroll()
  const lastScrollY = useRef(0)
  const headerY = useMotionValue(0)
  const items = useShopCartStore(state => state.items)
  // Total quantity, not array length — adding another unit of the same product
  // grows quantity while length stays the same.
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const prevCartCount = useRef(cartCount)
  const pinnedUntil = useRef(0)

  useEffect(() => {
    const added = cartCount > prevCartCount.current
    prevCartCount.current = cartCount
    if (!added) return

    // An item was just added — on mobile the header may be scrolled out of view.
    // Slide it back down and pin it briefly so the user sees the cart icon update.
    pinnedUntil.current = Date.now() + CART_PEEK_DURATION
    lastScrollY.current = scrollY.get() // avoid a jump when normal scroll handling resumes
    const controls = animate(headerY, 0, { type: 'tween', ease: 'easeOut', duration: 0.3 })
    return () => controls.stop()
  }, [cartCount, headerY, scrollY])

  useMotionValueEvent(scrollY, 'change', current => {
    // Keep header pinned for a moment after an item is added to the cart
    if (Date.now() < pinnedUntil.current) {
      headerY.set(0)
      lastScrollY.current = current
      return
    }

    // Always show header at the top
    if (current < TOP_THRESHOLD) {
      headerY.set(0)
      lastScrollY.current = current
      return
    }

    // Calculate scroll delta
    const delta = current - lastScrollY.current
    const currentY = headerY.get()

    // User "pulls" the header with scroll (with speed multiplier)
    // Scrolling down (delta > 0): move header up (negative Y)
    // Scrolling up (delta < 0): move header down (towards 0)
    const newY = Math.max(-HEADER_HEIGHT, Math.min(0, currentY - delta * SCROLL_SPEED))

    headerY.set(newY)
    lastScrollY.current = current
  })

  return (
    <motion.header
      style={{ y: headerY }}
      transition={{
        type: 'tween',
        ease: 'linear',
        duration: 0.15,
      }}
      className={cn(
        'fixed top-0 z-50 h-24 min-h-24 w-full',
        'bg-linear-to-t from-layout-gradient-from via-layout-gradient-to to-layout-gradient-to',
        'md:transform-none!',
        className,
      )}
      {...props}
    >
      {children}
    </motion.header>
  )
}
