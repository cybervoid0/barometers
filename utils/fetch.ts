import { barometersApiRoute, barometerTypesApiRoute } from '@/app/constants'
import { IBarometer } from '@/models/barometer'
import { IBarometerType } from '@/models/type'

/**
 * Returns a specific barometer details
 * @param slug - slug
 */
export function fetchBarometers(slug: string): Promise<IBarometer>
/**
 * Returns a full list of barometers in the collection
 */
export function fetchBarometers(): Promise<IBarometer[]>
/**
 * Returns a list of barometers filtered by the query string (type, sort)
 * @param qs - query string parameters
 */
export function fetchBarometers(qs: Record<string, string>): Promise<IBarometer[]>
export async function fetchBarometers(
  slugOrQs?: string | Record<string, string>,
): Promise<IBarometer | IBarometer[]> {
  const input =
    process.env.NEXT_PUBLIC_BASE_URL +
    barometersApiRoute +
    (typeof slugOrQs === 'string' ? slugOrQs : slugOrQs ? `?${new URLSearchParams(slugOrQs)}` : '')

  const res = await fetch(input, {
    next: {
      revalidate: 600,
    },
  })
  if (!res.ok) throw new Error(res.statusText)
  return res.json()
}

export function fetchTypes(): Promise<IBarometerType[]>
export function fetchTypes(qs: Record<string, string>): Promise<IBarometerType>
export async function fetchTypes(
  qs?: Record<string, string>,
): Promise<IBarometerType[] | IBarometerType> {
  const res = await fetch(
    process.env.NEXT_PUBLIC_BASE_URL +
      barometerTypesApiRoute +
      (qs ? `?${new URLSearchParams(qs)}` : ''),
  )
  return res.json()
}
