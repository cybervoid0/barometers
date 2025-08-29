import 'server-only'

import { GoogleAnalytics } from '@next/third-parties/google'
import type { Viewport } from 'next'
import { Cinzel, Raleway } from 'next/font/google'
import type { PropsWithChildren } from 'react'
import { Toaster } from 'sonner'
import 'vanilla-cookieconsent/dist/cookieconsent.css'
import './globals.css'
import { Footer, Header } from '@/components/containers'
import { CheckConsent, CookieConsent } from '@/components/elements'
import { withPrisma } from '@/prisma/prismaClient'
import { CountryProvider } from '@/providers/CountryProvider'
import { cn } from '@/utils'
import { jsonLd, meta } from '../constants/metadata'
import Providers from '../providers'

const raleway = Raleway({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-raleway',
})
const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-cinzel',
})

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [{ color: 'white' }],
}
const gtag = process.env.NEXT_PUBLIC_GTAG ?? ''

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

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <CountryProvider>
        <head>
          <CheckConsent service="googleAnalytics" category="analytics">
            <GoogleAnalytics gaId={gtag} />
          </CheckConsent>
          <link rel="shortcut icon" href="/favicon.svg" />
          <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
          <meta
            name="google-site-verification"
            content="UO-Rt1mPCNM6GZFQEFMmvtMfz1Ft4T62yqfN5mDGyjU"
          />
          <meta name="msvalidate.01" content="09CC87C263AEB12612A9A1C31447E181" />
          <script
            type="application/ld+json"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: required for JSON-LD structured data
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        </head>
        <body
          className={cn(
            raleway.variable,
            cinzel.variable,
            'bg-background font-raleway text-foreground',
          )}
        >
          <Providers>
            <CookieConsent />
            <Toaster position="top-center" richColors />
            <div className="flex h-screen flex-col">
              <Header />
              <main className="xs:px-0 container mx-auto grow px-2! pb-12 sm:px-4!">
                {children}
              </main>
              <Footer />
            </div>
          </Providers>
        </body>
      </CountryProvider>
    </html>
  )
}
