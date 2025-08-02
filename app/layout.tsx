import { type PropsWithChildren } from 'react'
import { type Viewport } from 'next'
import { GoogleAnalytics } from '@next/third-parties/google'
import { Raleway } from 'next/font/google'
import { Notifications } from '@mantine/notifications'
import './globals.css'
import { Footer, Header } from './components'
import Providers from './providers'
import { meta, jsonLd } from './metadata'
import { withPrisma } from '@/prisma/prismaClient'
import { cn } from '@/lib/utils'

const raleway = Raleway({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-raleway',
})

export const viewport: Viewport = {
  colorScheme: 'light dark',
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

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <GoogleAnalytics gaId="G-Q8ZR89R225" />
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
      <body className={cn(raleway.variable, 'font-raleway bg-background text-foreground')}>
        <Providers>
          <Notifications />
          <div className="flex h-screen flex-col">
            <Header />
            <div className="grow pb-12 shadow-lg">{children}</div>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
