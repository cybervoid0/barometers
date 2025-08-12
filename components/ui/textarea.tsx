import * as React from 'react'

import { cn } from '@/utils'

interface TextareaProps extends React.ComponentProps<'textarea'> {
  autoResize?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, autoResize = false, onChange, ...props }, forwardedRef) => {
    const innerRef = React.useRef<HTMLTextAreaElement | null>(null)

    // Merge forwarded ref with innerRef via callback ref
    const setRef = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        innerRef.current = node
        if (typeof forwardedRef === 'function') {
          forwardedRef(node)
        } else if (forwardedRef && 'current' in forwardedRef) {
          ;(forwardedRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node
        }
        // Autosize immediately on mount with existing value
        if (autoResize && node) {
          node.style.height = 'auto'
          node.style.height = `${node.scrollHeight}px`
        }
      },
      [autoResize, forwardedRef],
    )

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoResize) {
        const el = e.currentTarget
        el.style.height = 'auto'
        el.style.height = `${el.scrollHeight}px`
      }
      onChange?.(e)
    }

    return (
      <textarea
        className={cn(
          'border-input placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[60px] w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs focus-visible:ring-1 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          autoResize && 'resize-none overflow-hidden',
          className,
        )}
        ref={setRef}
        onChange={handleChange}
        {...props}
      />
    )
  },
)
Textarea.displayName = 'Textarea'

export { Textarea }
