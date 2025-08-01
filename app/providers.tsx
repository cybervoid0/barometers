'use client'

import '@mantine/core/styles.css'
import { PropsWithChildren } from 'react'
import { MantineProvider } from '@mantine/core'
import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/theme/ThemeProvider'
import { TooltipProvider } from '@/components/ui/tooltip'

const queryClient = new QueryClient()

export default function Providers({ children }: PropsWithChildren) {
  return (
    <MantineProvider>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider>{children}</TooltipProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SessionProvider>
    </MantineProvider>
  )
}
