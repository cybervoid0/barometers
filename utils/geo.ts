import 'server-only'

import { headers } from 'next/headers'
import { EU_ALPHA2 } from '@/constants'

export function getGeoFromHeaders() {
  const h = headers()
  const country = (h.get('CF-IPCountry') || '').toUpperCase() // Cloudflare
  const isEU = EU_ALPHA2.has(country)
  return { country, isEU }
}
