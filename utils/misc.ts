import slugify from 'slugify'
import traverse from 'traverse'
import { Jimp, rgbaToInt } from 'jimp'

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

/**
 * Handles API response errors by extracting a detailed error message from the response body.
 * Falls back to the default statusText if no message is provided or parsing fails.
 * @param res - The Response object from the fetch call.
 * @throws {Error} Throws an error with the extracted or default error message.
 */
export async function handleApiError(res: Response): Promise<void> {
  try {
    const errorData = await res.json()
    const errorMessage = errorData.message || res.statusText
    throw new Error(errorMessage)
  } catch (error) {
    throw new Error(res.statusText ?? res.text ?? 'handleApiError: unknown error')
  }
}

/**
 * Downloads image to the browser memory and creates a blurred thumbnail for displaying as Next Image placeholder
 */
export async function getThumbnailBase64(imgUrl: string) {
  const image = await Jimp.read(imgUrl)
  image.background = rgbaToInt(239, 239, 239, 255)
  return image.resize({ h: 32 }).blur(1).getBase64('image/jpeg', { quality: 30 })
}
