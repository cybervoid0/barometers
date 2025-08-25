'use client'

import Cookies from 'js-cookie'
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { EU_ALPHA2 } from '@/constants'

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
  const [country, setCountry] = useState<string>('US')
  const [isEU, setIsEU] = useState<boolean>(false)
  useEffect(() => {
    const geoCountry = Cookies.get('geo_country') ?? 'US'
    const isEurope = EU_ALPHA2.has(geoCountry)
    setCountry(geoCountry)
    setIsEU(isEurope)
  }, [])
  const value = useMemo(() => ({ country, isEU }), [country, isEU])
  return <CountryContext.Provider value={value}>{children}</CountryContext.Provider>
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
