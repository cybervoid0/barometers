import React from 'react'
import { Metadata, Viewport } from 'next'
import { GoogleAnalytics } from '@next/third-parties/google'
import { ColorSchemeScript, Box, Stack } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import './global.scss'
import { Footer, Header } from './components'
import Providers from './providers'
import { appShortName, appDescription } from './constants'
import styles from './styles.module.scss'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL),
  title: appShortName,
  description: appDescription,
  keywords: [
    'barometer',
    'antique',
    'collector',
    'collection',
    'history of science',
    'auction',
    'aneroid',
    'mercury',
  ],
  openGraph: {
    title: appShortName,
    description: appDescription,
    url: process.env.NEXT_PUBLIC_BASE_URL,
    images: { url: '/images/logo-arrow.png', alt: appShortName },
  },
  twitter: {
    card: 'summary_large_image',
    title: appShortName,
    description: appDescription,
    images: { url: '/images/logo-arrow.png', alt: appShortName },
  },
}

export const viewport: Viewport = {
  colorScheme: 'only light',
  themeColor: [{ color: 'white' }],
}

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="en">
      <head>
        <GoogleAnalytics gaId="G-Q8ZR89R225" />
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
        <meta
          name="google-site-verification"
          content="UO-Rt1mPCNM6GZFQEFMmvtMfz1Ft4T62yqfN5mDGyjU"
        />
        <meta name="msvalidate.01" content="09CC87C263AEB12612A9A1C31447E181" />
      </head>
      <body>
        <Providers>
          <Notifications />
          <Stack h="100vh" gap={0}>
            <Header />
            <Box className={styles.main}>{children}</Box>
            <Footer />
          </Stack>
        </Providers>
      </body>
    </html>
  )
}
