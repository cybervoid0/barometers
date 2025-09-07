'use client'

import Link from 'next/link'
import type { ComponentProps } from 'react'
import { showPreferences } from 'vanilla-cookieconsent'
import { Separator } from '@/components/ui'
import { FrontRoutes } from '@/constants'
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
    <div className="inline-flex items-center gap-2">
      <Link className="text-xs" href={FrontRoutes.CookiePolicy}>
        Cookie Policy
      </Link>
      <Separator orientation="vertical" className="h-3" />
      <button
        onClick={showPreferences}
        className={cn(
          'decoration-muted-foreground hover:decoration-foreground cursor-pointer text-xs underline',
          className,
        )}
        {...props}
      >
        {children}
      </button>
    </div>
  )
}

export { ManageCookies }
