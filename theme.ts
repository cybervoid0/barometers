'use client'

import { createTheme, virtualColor, colorsTuple } from '@mantine/core'
import { Raleway } from 'next/font/google'

const raleway = Raleway({
  subsets: ['cyrillic', 'latin'],
})

export const theme = createTheme({
  fontFamily: raleway.style.fontFamily,
  colors: {
    primary: colorsTuple('#473e36'),
    tabsUnderline: virtualColor({
      name: 'tabsUnderline',
      dark: 'green',
      light: 'red',
    }),
  },
  components: {
    Pagination: {
      defaultProps: {
        mt: 'lg',
        c: 'dark',
        color: 'dark',
        style: {
          alignSelf: 'center',
        },
      },
    },
  },
})
