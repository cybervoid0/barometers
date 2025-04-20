'use client'

import { Box, BoxProps, Burger } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { MobileMenu } from './mobile-menu'
import { Tabs } from './tabs'
import { CategoryListDTO } from '@/app/types'

interface Props extends BoxProps {
  categories: CategoryListDTO
}

export function Navigation({ categories = [], ...props }: Props) {
  const [opened, { close, open }] = useDisclosure()
  return (
    <Box {...props}>
      <Burger size="md" hiddenFrom="md" opened={opened} onClick={open} />
      <Tabs categories={categories} visibleFrom="md" />
      <MobileMenu categories={categories} opened={opened} onClose={close} />
    </Box>
  )
}
