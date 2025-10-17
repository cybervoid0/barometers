'use client'

import type { SVGMotionProps } from 'motion/react'
import { motion } from 'motion/react'
import type { HTMLAttributes } from 'react'
import { cn } from '@/utils'

interface HamburgerProps extends HTMLAttributes<HTMLSpanElement> {
  isOpen: boolean
  strokeWidth?: number
}

/**
 * A responsive hamburger menu button component that animates between open and closed states.
 * Displays three lines that transform into an "X" when open, commonly used for toggling navigation menus.
 */
function Hamburger({ strokeWidth = 1.25, color, isOpen, className, ...props }: HamburgerProps) {
  return (
    <button
      className={cn('p-2 stroke-foreground', className)}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      type="button"
      {...props}
    >
      <div className="flex w-fit">
        <motion.svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          animate={isOpen ? 'open' : 'closed'}
          initial={false}
        >
          <title>{isOpen ? 'Close menu' : 'Open menu'}</title>
          <Path
            variants={{
              // means: move pen to (4,6), draw horiz line to (20,6)
              closed: { d: 'M 4 6.625 L 20 6.625' },
              open: { d: 'M 5 5 L 19 19' },
            }}
            strokeWidth={strokeWidth}
          />
          <Path
            d="M 4 11.625 L 20 11.625"
            variants={{
              closed: { opacity: 1 },
              open: { opacity: 0 },
            }}
            transition={{ duration: 0.1 }} // middle line disappears quickly
            strokeWidth={strokeWidth}
          />
          <Path
            variants={{
              closed: { d: 'M 4 16.625 L 20 16.625' },
              open: { d: 'M 5 19 L 19 5' },
            }}
            strokeWidth={strokeWidth}
          />
        </motion.svg>
      </div>
    </button>
  )
}

const Path = ({
  fill = 'transparent',
  strokeWidth = 1,
  strokeLinecap = 'round',
  ...props
}: SVGMotionProps<SVGPathElement>) => (
  <motion.path fill={fill} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} {...props} />
)

export { Hamburger }
