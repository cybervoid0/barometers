import React from 'react'
import { Metadata, Viewport } from 'next'
import { ColorSchemeScript, Box, Stack } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import './global.scss'
import { Footer, Header } from './components'
import Providers from './providers'
import { appShortName, appDescription } from './constants'

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
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <Providers>
          <Notifications />
          <Stack h="100vh" gap={0}>
            <Header />
            <Box bg="#efefef" style={{ flexGrow: 1 }}>
              {children}
            </Box>
            <Footer />
          </Stack>
        </Providers>
      </body>
    </html>
  )
}
