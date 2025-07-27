import bundleAnalyzer from '@next/bundle-analyzer';
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

export default withBundleAnalyzer({
  reactStrictMode: false,
  productionBrowserSourceMaps: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
    serverComponentsExternalPackages: ['mongoose'],
  },

  images: {
    loader: 'custom',
    loaderFile: './utils/image-loader.ts',
  },
  webpack: config => {
    config.resolve.alias['@'] = path.resolve('./')
    return config
  },
  redirects: async () => {
    const categories = ['miscellaneous', 'recorders', 'pocket', 'mercury', 'bourdon', 'aneroid']
    return categories.map(name => {
      const source = '/collection/categories/' + name
      return {
        source, // old route
        destination: source + '/date/1', // new route
        permanent: true,
      }
    })
  },
  allowedDevOrigins: [new URL(process.env.NEXT_PUBLIC_BASE_URL).hostname],
})
