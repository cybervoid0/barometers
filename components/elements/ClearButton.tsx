import { CircleX } from 'lucide-react'
import type { ComponentProps } from 'react'
import { cn } from '@/utils'

export function ClearButton({ className, ...props }: ComponentProps<'button'>) {
  return (
    <button
      type="button"
      className={cn(
        'absolute right-2 top-1/2 w-5 h-5 -translate-y-1/2 text-muted-foreground cursor-pointer',
        className,
      )}
      {...props}
    >
      <CircleX strokeWidth={1} className="w-full h-full" />
    </button>
  )
}
