import { Viewport } from 'next'
import { Analytics as VercelAnalytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { GoogleAnalytics } from '@next/third-parties/google'
import { ColorSchemeScript, Box, Stack } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import './global.scss'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import { Footer, Header } from './components'
import Providers from './providers'
import { meta, jsonLd } from './metadata'
import { withPrisma } from '@/prisma/prismaClient'

export const viewport: Viewport = {
  colorScheme: 'only light',
  themeColor: [{ color: 'white' }],
}

export const generateMetadata = withPrisma(async prisma => {
  const images = (
    await prisma.category.findMany({
      select: {
        name: true,
        images: {
          select: {
            url: true,
          },
        },
      },
    })
  ).map(({ images: [image], name }) => ({
    url: image.url,
    alt: name,
  }))
  return {
    ...meta,
    openGraph: {
      ...meta.openGraph,
      images,
    },
    twitter: {
      ...meta.twitter,
      images,
    },
  }
})

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="en">
      <head>
        <GoogleAnalytics gaId="G-Q8ZR89R225" />
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
        <meta
          name="google-site-verification"
          content="UO-Rt1mPCNM6GZFQEFMmvtMfz1Ft4T62yqfN5mDGyjU"
        />
        <meta name="msvalidate.01" content="09CC87C263AEB12612A9A1C31447E181" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <Providers>
          <Notifications />
          <Stack h="100vh" gap={0}>
            <Header />
            <Box className="flex-grow bg-page-bg pb-12 shadow-lg">{children}</Box>
            <Footer />
          </Stack>
        </Providers>
        <VercelAnalytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
