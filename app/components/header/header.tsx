'use client'

import React from 'react'
import NextImage from 'next/image'
import NextLink from 'next/link'
import { Center, Group, Burger, rem, Image, Space, Box, Anchor } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { companyName } from '../../config/constants'
import { WideScreenTabs } from './tabs'
import styles from './header.module.scss'

export function Header() {
  const [opened, { toggle }] = useDisclosure()
  return (
    <Box className={styles.container}>
      <Group pos="relative">
        <Burger display={{ md: 'none' }} opened={opened} onClick={toggle} />
        <Center className={styles.center}>
          <Anchor component={NextLink} href="/">
            <Image
              component={NextImage}
              alt={companyName}
              width={295}
              height={87.5}
              src="/Jason_Clarke_Antiques_Long_Centre_Logo_295x@2x.webp"
            />
          </Anchor>
        </Center>
        <Space display={{ md: 'none' }} w={rem(30)} />
        <WideScreenTabs />
      </Group>
    </Box>
  )
}
