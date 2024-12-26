import bundleAnalyzer from '@next/bundle-analyzer';
import path from 'path'
import { fileURLToPath } from 'url'
import { withPrisma } from './prisma/prismaClient'
import { categoriesRoute, defaultCategorySortPage } from './app/constants'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

export default withBundleAnalyzer({
  reactStrictMode: false,
  productionBrowserSourceMaps: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
    serverComponentsExternalPackages: ['mongoose'],
  },
  sassOptions: {
    prependData: `@import "./_mantine.scss";`,
  },
  images: {
    formats: ['image/avif'],
    localPatterns: [
      {
        pathname: '/images/**',
      },
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
    ],
  },
  webpack: config => {
    config.resolve.alias['@'] = path.resolve('./')
    return config
  },
  redirects: withPrisma(async prisma => {
    const categories = await prisma.category.findMany({ select: { name: true } })
    return categories.map(({ name }) => {
      const source = categoriesRoute + name
      return {
        source, // old route
        destination: source + defaultCategorySortPage, // new route
        permanent: true,
      }
    })
  }),
})
