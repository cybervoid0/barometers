import slugify from 'slugify'

export function slug(text: string): string {
  return encodeURIComponent(
    slugify(text, { trim: true, lower: true, replacement: '_', remove: /[,.'"]/g }),
  )
}

export const getBrandSlug = (lastName: string, firstName?: string | undefined | null) =>
  slug(`${firstName ? `${firstName}_` : ''}${lastName}`)

/**
 * Removes slashes at the beginning/end of API route URL
 */
export const trimTrailingSlash = (url: string) => url.replace(/\/+$/, '')
export const trimLeadingSlashes = (url: string) => url.replace(/^\/+/, '')
export const trimSlashes = (url: string) => trimTrailingSlash(trimLeadingSlashes(url))
export function normalizeLocalPath(path: string): string
export function normalizeLocalPath(path?: string): string | undefined
export function normalizeLocalPath(path?: string): string | undefined {
  if (typeof path === 'undefined') return undefined
  return `/${trimLeadingSlashes(path)}`
}
