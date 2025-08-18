'use client'

import { type PropsWithChildren, useState, useEffect } from 'react'
import * as VanillaCookieConsent from 'vanilla-cookieconsent'

interface Props extends PropsWithChildren {
  service: string
  category: string
}

function CheckConsent({ service, category, children }: Props) {
  const [hasConsent, setHasConsent] = useState(false)

  useEffect(() => {
    const checkConsent = () => {
      const isAccepted = VanillaCookieConsent.acceptedService(service, category)
      if (isAccepted) setHasConsent(true)
    }

    // Check initial consent
    checkConsent()

    // Add event listeners
    window.addEventListener('cc:onConsent', checkConsent)
    window.addEventListener('cc:onChange', checkConsent)

    // Cleanup
    return () => {
      window.removeEventListener('cc:onConsent', checkConsent)
      window.removeEventListener('cc:onChange', checkConsent)
    }
  }, [category, service])

  return hasConsent ? children : null
}

export { CheckConsent }
