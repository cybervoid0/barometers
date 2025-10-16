'use client'

import { motion, useMotionValue, useMotionValueEvent, useScroll } from 'motion/react'
import type { ComponentProps } from 'react'
import { useRef } from 'react'
import { cn } from '@/utils'

const HEADER_HEIGHT = 96 // px
const TOP_THRESHOLD = 200 // always show header before this scroll position
const SCROLL_SPEED = 0.5 // scroll speed multiplier (0.5 = half speed, 1 = normal speed)

export function AnimatedHeader({
  children,
  className,
  ...props
}: ComponentProps<typeof motion.header>) {
  const { scrollY } = useScroll()
  const lastScrollY = useRef(0)
  const headerY = useMotionValue(0)

  useMotionValueEvent(scrollY, 'change', current => {
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
        'bg-gradient-to-t from-layout-gradient-from via-layout-gradient-to to-layout-gradient-to',
        'md:!transform-none',
        className,
      )}
      {...props}
    >
      {children}
    </motion.header>
  )
}
