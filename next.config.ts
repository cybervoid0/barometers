import path from 'node:path'
import bundleAnalyzer from '@next/bundle-analyzer'
import type { NextConfig } from 'next'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const isLocal = process.env.NODE_ENV === 'development'
const minioUrl = process.env.NEXT_PUBLIC_MINIO_URL
const minioBucket = process.env.NEXT_PUBLIC_MINIO_BUCKET

const nextConfig: NextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    ...(isLocal
      ? {}
      : {
          loader: 'custom',
          loaderFile: './utils/image-loader.ts',
        }),

    deviceSizes: [640, 1080, 1920],
    imageSizes: [640, 1080, 1920],
    formats: ['image/avif'],
    qualities: [95],
    minimumCacheTTL: 2678400,
    // Allow images from MinIO for Next.js optimization in development
    remotePatterns: [
      {
        protocol: 'http',
        hostname: process.env.MINIO_ENDPOINT ?? '',
        port: process.env.MINIO_PORT,
        pathname: '/**',
      },
    ],
  },
  rewrites: async () => {
    if (!minioBucket || !minioUrl) return []
    return [
      {
        source: '/:prefix(categories|gallery|history|shared|temp)/:path*',
        destination: `${minioUrl}/${minioBucket}/:prefix/:path*`,
      },
    ]
  },
  webpack: config => {
    config.resolve.alias['@'] = path.resolve('./')
    return config
  },
  turbopack: {
    resolveAlias: {
      '@': path.resolve('./'),
    },
  },
  redirects: async () => {
    const categories = ['miscellaneous', 'recorders', 'pocket', 'mercury', 'bourdon', 'aneroid']
    return categories.map(name => {
      const source = `/collection/categories/${name}`
      return {
        source, // old route
        destination: `${source}/date/1`, // new route
        permanent: true,
      }
    })
  },
  allowedDevOrigins: process.env.NEXT_PUBLIC_BASE_URL
    ? [new URL(process.env.NEXT_PUBLIC_BASE_URL).hostname]
    : [],
}

export default withBundleAnalyzer(nextConfig)
