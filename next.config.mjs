import path from 'node:path'
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

export default withBundleAnalyzer({
  reactStrictMode: false,
  productionBrowserSourceMaps: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    loader: 'custom',
    loaderFile: './utils/image-loader.ts',
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
  allowedDevOrigins: [new URL(process.env.NEXT_PUBLIC_BASE_URL).hostname],
})
