'use client'

import { useTheme } from 'next-themes'
import { useEffect } from 'react'
import * as VanillaCookieConsent from 'vanilla-cookieconsent'
import { useCountry } from '@/providers/CountryProvider'
import { cookieConsentConfig } from '@/services/cookie-consent'

/**
 * Main component that initializes the cookie consent system and syncs theme with the app.
 */
function CookieConsent() {
  const { isEU } = useCountry()
  const { theme } = useTheme()

  useEffect(() => {
    if (!isEU) return
    // Initialize cookie consent for EU users only
    VanillaCookieConsent.run(cookieConsentConfig)
  }, [isEU])

  useEffect(() => {
    // Sync cookie consent theme with app theme
    if (theme === 'dark') {
      document.documentElement.classList.add('cc--darkmode')
    } else {
      document.documentElement.classList.remove('cc--darkmode')
    }
  }, [theme])

  // This component doesn't render anything visible
  // It just initializes the cookie consent system
  return null
}

export { CookieConsent }
