'use client'

import { cn } from '@/utils'
import { type ComponentProps } from 'react'
import { showPreferences } from 'vanilla-cookieconsent'

/**
 * Styled link that opens cookie preferences modal.
 */
function ManageCookies({
  className,
  children = 'Manage cookies',
  ...props
}: ComponentProps<'button'>) {
  return (
    <button
      onClick={showPreferences}
      className={cn(
        'decoration-muted-foreground hover:decoration-foreground inline cursor-pointer text-xs underline',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export { ManageCookies }
