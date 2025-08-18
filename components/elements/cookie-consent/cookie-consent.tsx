'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'
import * as VanillaCookieConsent from 'vanilla-cookieconsent'
import { cookieConsentConfig } from '@/services/cookie-consent'

function CookieConsent() {
  const { theme } = useTheme()

  useEffect(() => {
    // Initialize cookie consent
    VanillaCookieConsent.run(cookieConsentConfig)
  }, [])

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
