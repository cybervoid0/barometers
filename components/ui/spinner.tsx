import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import type React from 'react'
import type { ComponentProps } from 'react'
import { cn } from '@/utils'

const spinnerVariants = cva('flex-col items-center justify-center', {
  variants: {
    show: {
      true: 'flex',
      false: 'hidden',
    },
  },
  defaultVariants: {
    show: true,
  },
})

const loaderVariants = cva('animate-spin text-primary', {
  variants: {
    size: {
      small: 'size-6',
      medium: 'size-8',
      large: 'size-12',
    },
  },
  defaultVariants: {
    size: 'medium',
  },
})

interface SpinnerContentProps
  extends VariantProps<typeof spinnerVariants>,
    VariantProps<typeof loaderVariants> {
  className?: string
  children?: React.ReactNode
}

export function Spinner({ size, show, children, className }: SpinnerContentProps) {
  return (
    <span className={spinnerVariants({ show })}>
      <Loader2 className={cn(loaderVariants({ size }), className)} />
      {children}
    </span>
  )
}

interface LoadingOverlayProps extends ComponentProps<'div'> {
  spinnerProps?: SpinnerContentProps
}
export function LoadingOverlay({ spinnerProps, className, ...props }: LoadingOverlayProps) {
  return (
    <div
      className={cn('fixed inset-0 flex items-center justify-center bg-card/80 z-50', className)}
      {...props}
    >
      <Spinner size={spinnerProps?.size ?? 'large'} {...spinnerProps} />
    </div>
  )
}
