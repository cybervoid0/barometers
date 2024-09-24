import React from 'react'
import { Metadata, Viewport } from 'next'
import { ColorSchemeScript, Box, Stack } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import './global.scss'
import { Footer, Header } from './components'
import Providers from './providers'

export const metadata: Metadata = {
  title: 'Antique Barometers',
  creator: 'CyberVoid',
  description: 'History of antique barometers',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
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
