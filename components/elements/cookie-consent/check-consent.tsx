'use client'

import { Check, LockKeyhole } from 'lucide-react'
import { type ComponentProps, useEffect, useState } from 'react'
import * as VanillaCookieConsent from 'vanilla-cookieconsent'
import { Button, Card } from '@/components/ui'
import { useCountry } from '@/providers/CountryProvider'
import { cn } from '@/utils'
import { ManageCookies } from './manage-cookies'

interface Props extends ComponentProps<'div'> {
  /** Service name (e.g., "googleAnalytics", "payPal") */
  service: string
  /** Cookie category (e.g., "analytics", "functional") */
  category: string
  /** Show placeholder when consent not given */
  placeholder?: boolean
}

/**
 * Wrapper component that conditionally renders children based on cookie consent.
 *
 * Shows children only when user has consented to the service.
 * Shows placeholder with enable button when no consent.
 * Automatically updates when consent changes.
 */
function CheckConsent({ service, category, placeholder = false, className, children }: Props) {
  const { isEU } = useCountry()
  const [hasConsent, setHasConsent] = useState(!isEU) // Non-EU users have consent by default

  useEffect(() => {
    // Non-EU users always have consent
    if (!isEU) {
      setHasConsent(true)
      return
    }

    // EU users need to check vanilla-cookieconsent
    const checkConsent = () => {
      const isAccepted = VanillaCookieConsent.acceptedService(service, category)
      setHasConsent(isAccepted)
    }

    // Check initial consent
    checkConsent()

    // Add event listeners for consent changes
    window.addEventListener('cc:onConsent', checkConsent)
    window.addEventListener('cc:onChange', checkConsent)

    // Cleanup
    return () => {
      window.removeEventListener('cc:onConsent', checkConsent)
      window.removeEventListener('cc:onChange', checkConsent)
    }
  }, [category, service, isEU])

  return hasConsent ? (
    children
  ) : placeholder ? (
    <Card
      className={cn(
        'bg-muted/50 mx-auto my-10 w-full max-w-[600px] px-2 py-4 text-center sm:p-8',
        className,
      )}
    >
      <div className="flex flex-row items-center">
        <div className="bg-destructive/50 mx-auto flex h-16 w-16 shrink-0 items-center justify-center rounded-full">
          <LockKeyhole className="text-muted-foreground" />
        </div>
        <div className="grow">
          <div>
            <h3 className="mb-4 text-lg font-semibold sm:text-xl">
              {service} Service Requires Permission
            </h3>
            <p className="text-muted-foreground mb-3 text-xs sm:mb-5 sm:text-base">
              To enable this service, consent to use {category} cookies. These cookies help provide
              enhanced functionality.
            </p>

            <Button onClick={() => VanillaCookieConsent.acceptService(service, category)} size="sm">
              <Check size={16} />
              Enable {category} Cookies
            </Button>
          </div>
          <p className="muted-foreground mt-3 text-xs sm:mt-5 sm:text-sm">
            You can manage all cookie preferences in the{' '}
            <ManageCookies className="text-xs sm:text-sm">cookie settings</ManageCookies>
          </p>
        </div>
      </div>
    </Card>
  ) : null
}

export { CheckConsent }
