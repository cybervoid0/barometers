import { barometersApiRoute } from '@/app/constants'
import { IBarometer } from '@/models/barometer'

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
export function fetchBarometers(qs: URLSearchParams): Promise<IBarometer[]>
export async function fetchBarometers(
  slugOrQs?: string | URLSearchParams,
): Promise<IBarometer | IBarometer[]> {
  const input =
    process.env.NEXT_PUBLIC_BASE_URL +
    barometersApiRoute +
    (typeof slugOrQs === 'string' ? slugOrQs : slugOrQs ? `?${slugOrQs}` : '')
  const res = await fetch(input, {
    next: { revalidate: 600 },
  })
  if (!res.ok) throw new Error(res.statusText)
  return res.json()
}
