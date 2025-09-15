import customImageLoader from '../image-loader'

// Mock environment variables
const originalEnv = process.env
beforeAll(() => {
  process.env = {
    ...originalEnv,
    NEXT_PUBLIC_MINIO_URL: 'https://cdn.example.com',
    NEXT_PUBLIC_MINIO_BUCKET: 'barometers-bucket',
  }
})

afterAll(() => {
  process.env = originalEnv
})

describe('customImageLoader', () => {
  it('should generate correct Cloudflare Image URL', () => {
    const result = customImageLoader({
      src: 'barometers/test-image.jpg',
      width: 800,
      quality: 90,
    })

    expect(result).toBe(
      'https://cdn.example.com/cdn-cgi/image/width=800,quality=90,format=auto/barometers-bucket/barometers/test-image.jpg',
    )
  })

  it('should use default quality when not provided', () => {
    const result = customImageLoader({
      src: 'test.jpg',
      width: 600,
      quality: 75, // quality is required, so we provide default
    })

    expect(result).toContain('quality=75')
  })

  it('should use default width when 0 is provided', () => {
    const result = customImageLoader({
      src: 'test.jpg',
      width: 0,
      quality: 80,
    })

    expect(result).toContain('width=512') // default width
  })

  it('should handle different image formats', () => {
    const result = customImageLoader({
      src: 'images/photo.png',
      width: 400,
      quality: 85,
    })

    expect(result).toContain('format=auto')
    expect(result).toContain('images/photo.png')
  })

  it('should throw error when MINIO_URL is not set', () => {
    const originalUrl = process.env.NEXT_PUBLIC_MINIO_URL
    delete process.env.NEXT_PUBLIC_MINIO_URL

    expect(() => {
      customImageLoader({
        src: 'test.jpg',
        width: 400,
        quality: 80,
      })
    }).toThrow('Image storage URL is not set')

    process.env.NEXT_PUBLIC_MINIO_URL = originalUrl
  })
})
