'use client'

import * as React from 'react'
import * as SeparatorPrimitive from '@radix-ui/react-separator'

import { cn } from '@/lib/utils'

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={cn(
      'shrink-0 bg-border',
      orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
      className,
    )}
    {...props}
  />
))
Separator.displayName = SeparatorPrimitive.Root.displayName

const SeparatorWithText = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> & {
    children: React.ReactNode
  }
>(({ children, className, ...props }, ref) => (
  <div className={cn('relative', className)}>
    <div className="absolute inset-0 flex items-center">
      <Separator orientation="horizontal" ref={ref} {...props} />
    </div>
    <div className="relative flex justify-center">
      <span className="bg-background">{children}</span>
    </div>
  </div>
))
SeparatorWithText.displayName = 'SeparatorWithText'

export { Separator, SeparatorWithText }
