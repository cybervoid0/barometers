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

export const getIconBuffer = (icon: string | undefined | null) =>
  icon && typeof icon === 'string'
    ? Buffer.from(icon.replace(/^data:image\/\w+;base64,/, ''), 'base64')
    : null

/**
 * Generates image from array buffer stored in the database
 * @param buffer
 * @returns
 */
export function bufferToBase64Url(buffer: Uint8Array | null) {
  const base64 = buffer ? Buffer.from(buffer).toString('base64') : null
  return base64 ? `data:image/png;base64,${base64}` : null
}
