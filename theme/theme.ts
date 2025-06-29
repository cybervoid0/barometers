'use client'

import {
  createTheme,
  virtualColor,
  colorsTuple,
  Anchor,
  Button,
} from '@mantine/core'
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
    Anchor: Anchor.extend({
      defaultProps: {
        c: 'dark',
      },
      styles: {
        root: {
          transition: 'transition: color ease-out 0.4s',
          '&:hover': {
            color: '#93360a',
          },
        },
      },
    }),
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
    Button: Button.extend({
      defaultProps: {
        color: 'dark',
      },
    }),
  },
})
