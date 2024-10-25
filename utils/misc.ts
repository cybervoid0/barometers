import slugify from 'slugify'
import traverse from 'traverse'

/**
 * Returns a deep object copy where string values are trimmed,
 * properties containing empty strings end empty arrays are removed
 */
export function cleanObject<T>(obj: T): T {
  return traverse(obj).forEach(function map(value) {
    if (typeof value === 'string') {
      const trimmedValue = value.trim()
      if (trimmedValue === '') {
        this.remove()
      } else {
        this.update(trimmedValue)
      }
    }
    if (Array.isArray(value) && value.length === 0) {
      this.remove()
    }
  })
}

export function slug(text: string): string {
  return encodeURIComponent(slugify(text, { lower: true, replacement: '_', remove: /[,.'"]/g }))
}

export function parseDate(dated: string): number[] | null {
  const patterns: {
    regex: RegExp
    extract: (m: string[]) => number[]
  }[] = [
    {
      regex: /(\d{4})-(\d{4})/,
      extract: m => [parseInt(m[1], 10), parseInt(m[2], 10)],
    }, // years interval
    {
      regex: /late (\d{2})(?:th|st|nd|rd) century-early (\d{2})(?:th|st|nd|rd) century/,
      extract: m => [
        (parseInt(m[1], 10) - 1) * 100 + 80, // e.g., late 19th century -> 1880
        (parseInt(m[2], 10) - 1) * 100 + 20, // early 20th century -> 1920
      ],
    }, // "late 19th-early 20th century"
    {
      regex: /early (\d{2})(?:th|st|nd|rd) century/,
      extract: m => [(parseInt(m[1], 10) - 1) * 100, (parseInt(m[1], 10) - 1) * 100 + 20],
    }, // "early 20th century"
    {
      regex: /mid (\d{2})(?:th|st|nd|rd) century/,
      extract: m => [(parseInt(m[1], 10) - 1) * 100 + 40, (parseInt(m[1], 10) - 1) * 100 + 60],
    }, // "mid 20th century"
    {
      regex: /late (\d{2})(?:th|st|nd|rd) century/,
      extract: m => [(parseInt(m[1], 10) - 1) * 100 + 80, (parseInt(m[1], 10) - 1) * 100 + 99],
    }, // "late 19th century"
    {
      regex: /(\d{4})(s|th)/,
      extract: m => [parseInt(m[1], 10), parseInt(m[1], 10) + 9],
    }, // "2000s", "1990th"
    {
      regex: /c\.(\d{4})/,
      extract: m => [parseInt(m[1], 10), parseInt(m[1], 10)],
    }, // Single date, e.g. "c.1930"
    {
      regex: /(\d{4})/,
      extract: m => [parseInt(m[1], 10), parseInt(m[1], 10)],
    }, // Single date, e.g. "1870"
  ]

  for (const pattern of patterns) {
    const match = dated.match(pattern.regex)
    if (match) {
      return pattern.extract(match)
    }
  }

  return null // if parsing failed
}
