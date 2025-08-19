'use client'

import { createContext, useContext, type PropsWithChildren } from 'react'

interface CountryContextType {
  /** User's country code (e.g., "DE", "US") */
  country: string
  /** Whether user is from EU (requires cookie consent) */
  isEU: boolean
}

const CountryContext = createContext<CountryContextType | undefined>(undefined)

interface Props extends PropsWithChildren {
  country: string
  isEU: boolean
}

/**
 * Provider that shares country and EU status across the application.
 *
 * Initialized once in layout.tsx with server-side detected country.
 * Used by cookie consent components to determine behavior.
 */
export function CountryProvider({ country, isEU, children }: Props) {
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
