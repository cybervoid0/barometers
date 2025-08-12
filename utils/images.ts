function loadImage(imgUrl: string): Promise<HTMLImageElement> {
  // Load original full-size image
  const image = new Image()
  image.crossOrigin = 'Anonymous' // Enable CORS to fetch the image
  image.src = imgUrl

  // Wait for the image to load
  return new Promise((resolve, reject) => {
    image.onload = () => resolve(image)
    image.onerror = reject
  })
}

/**
 * Creates a blurred thumbnail from an image URL and returns it as a Base64-encoded JPEG string.
 *
 * @param imgUrl - The URL of the source image.
 * @param backgroundColor - The background color to replace transparent areas (default: white).
 * @param blurRadius - The radius of the blur effect to apply (default: 1).
 * @param targetHeight - Optional target height; if not provided, it will be calculated to maintain the aspect ratio.
 * @returns A promise that resolves to a Base64-encoded JPEG string of the processed thumbnail.
 */
export async function getThumbnailBase64(
  imgUrl: string,
  backgroundColor: string = '#efefef',
  blurRadius: number = 1,
  targetHeight: number = 32, // Fixed height
): Promise<string> {
  const image = await loadImage(imgUrl)
  // Calculate proportional width based on the fixed height
  const aspectRatio = image.width / image.height
  const targetWidth = targetHeight * aspectRatio

  // Create a canvas with the calculated dimensions
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas context not available')

  canvas.width = targetWidth
  canvas.height = targetHeight

  // Fill the background with the specified color
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Apply blur filter if specified
  if (blurRadius > 0) {
    ctx.filter = `blur(${blurRadius}px)`
  }

  // Draw the resized image on the canvas
  ctx.drawImage(image, 0, 0, targetWidth, targetHeight)

  // Convert the canvas content to a PNG Base64 string
  return canvas.toDataURL('image/png') // Use PNG for lossless quality
}

export async function generateIcon(
  imgUrl?: string,
  size: number = 32,
  backgroundColor?: string,
): Promise<string | null> {
  if (!imgUrl) return null
  const image = await loadImage(imgUrl)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas context not available')
  canvas.width = size
  canvas.height = size

  if (backgroundColor) {
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, size, size)
  }

  ctx.drawImage(image, 0, 0, size, size)

  return canvas.toDataURL('image/png')
}
