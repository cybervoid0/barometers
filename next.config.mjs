import bundleAnalyzer from '@next/bundle-analyzer';
import path from 'path'

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
  },
  sassOptions: {
    prependData: `@use "./_mantine.scss" as *;`,
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
})
