'use client'

import type { ComponentProps } from 'react'
import { showPreferences } from 'vanilla-cookieconsent'
import { useCountry } from '@/providers/CountryProvider'
import { cn } from '@/utils'

/**
 * Styled link that opens cookie preferences modal.
 */
function ManageCookies({
  className,
  children = 'Manage cookies',
  ...props
}: ComponentProps<'button'>) {
  const { isEU } = useCountry()
  if (!isEU) return null
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
