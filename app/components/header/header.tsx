'use client'

import React from 'react'
import NextImage from 'next/image'
import NextLink from 'next/link'
import { Center, Group, Burger, rem, Image, Space, Box, Anchor } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { WideScreenTabs } from './Tabs'
import { MobileMenu } from './MobileMenu'
import styles from './Header.module.scss'

export function Header() {
  const [opened, { close, open }] = useDisclosure()
  return (
    <>
      <Box className={styles.container}>
        <Group pos="relative">
          <Burger display={{ md: 'none' }} opened={opened} onClick={open} />
          <Center className={styles.center}>
            <Anchor component={NextLink} href="/">
              <Image
                component={NextImage}
                alt="Antiques"
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
      <MobileMenu opened={opened} onClose={close} />
    </>
  )
}
