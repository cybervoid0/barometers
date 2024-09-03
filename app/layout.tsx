import '@mantine/core/styles.css'
import React from 'react'
import { Metadata, Viewport } from 'next'
import { MantineProvider, ColorSchemeScript, Box, Stack } from '@mantine/core'
import { theme } from '../theme'
import './global.css'
import { Footer, Header } from './components'
import { companyName } from './config/constants'

export const metadata: Metadata = {
  title: companyName,
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
        <MantineProvider defaultColorScheme="light" theme={theme}>
          <Stack h="100vh" gap={0}>
            <Header />
            <Box bg="#efefef" style={{ flexGrow: 1 }}>
              {children}
            </Box>
            <Footer />
          </Stack>
        </MantineProvider>
      </body>
    </html>
  )
}
