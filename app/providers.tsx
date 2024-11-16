'use client'

import '@mantine/core/styles.css'
import { PropsWithChildren } from 'react'
import { MantineProvider } from '@mantine/core'
import { SessionProvider } from 'next-auth/react'
import { theme } from '../theme'

export default function Providers({ children }: PropsWithChildren) {
  return (
    <MantineProvider defaultColorScheme="light" theme={theme}>
      <SessionProvider>{children}</SessionProvider>
    </MantineProvider>
  )
}
