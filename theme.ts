'use client'

import { createTheme, virtualColor } from '@mantine/core'
import { Raleway } from 'next/font/google'

const raleway = Raleway({
  subsets: ['cyrillic', 'latin'],
})

export const theme = createTheme({
  fontFamily: raleway.style.fontFamily,
  colors: {
    tabsUnderline: virtualColor({
      name: 'tabsUnderline',
      dark: 'green',
      light: 'red',
    }),
  },
})
