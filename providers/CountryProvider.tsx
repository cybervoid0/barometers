'use client'

import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react'
import { EU_ALPHA2 } from '@/constants'
import Cookies from 'js-cookie'

interface CountryContextType {
  /** User's country code (e.g., "DE", "US") */
  country: string
  /** Whether user is from EU (requires cookie consent) */
  isEU: boolean
}

const CountryContext = createContext<CountryContextType | undefined>(undefined)

/**
 * Provider that shares country and EU status across the application.
 *
 * Initialized once in layout.tsx with server-side detected country.
 * Used by cookie consent components to determine behavior.
 */
export function CountryProvider({ children }: PropsWithChildren) {
  const [country, setCountry] = useState<string>('??')
  const [isEU, setIsEU] = useState<boolean>(false)
  useEffect(() => {
    const country = Cookies.get('geo_country') ?? '!!'
    const isEU = EU_ALPHA2.has(country)
    setCountry(country)
    setIsEU(isEU)
  }, [])
  return <CountryContext.Provider value={{ country, isEU }}>{children}</CountryContext.Provider>
}

/**
 * Hook to access country and EU status in components.
 *
 * @returns {CountryContextType} Country code and EU status
 * @throws {Error} If used outside CountryProvider
 */
export function useCountry(): CountryContextType {
  const context = useContext(CountryContext)
  if (context === undefined) {
    throw new Error('useCountry must be used within a CountryProvider')
  }
  return context
}
