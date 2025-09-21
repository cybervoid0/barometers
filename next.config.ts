import path from 'node:path'
import bundleAnalyzer from '@next/bundle-analyzer'
import type { NextConfig } from 'next'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  reactStrictMode: false,
  productionBrowserSourceMaps: true,
  experimental: {
    reactCompiler: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    loader: 'custom',
    loaderFile: './utils/image-loader.ts',
    deviceSizes: [640, 1080, 1920],
    imageSizes: [640, 1080, 1920],
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
