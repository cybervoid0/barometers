import '@mantine/core/styles.css'
import { PropsWithChildren } from 'react'
import { MantineProvider } from '@mantine/core'
import { theme } from '../theme'

export default function Providers({ children }: PropsWithChildren) {
  return (
    <MantineProvider defaultColorScheme="light" theme={theme}>
      {children}
    </MantineProvider>
  )
}
