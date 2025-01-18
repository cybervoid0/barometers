'use client'

import { createTheme, virtualColor, colorsTuple, Anchor, Button } from '@mantine/core'
import { Raleway } from 'next/font/google'
import anchorSx from './anchor.module.scss'

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
      classNames: {
        root: anchorSx.root,
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
