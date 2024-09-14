'use client'

import React from 'react'
import NextImage from 'next/image'
import NextLink from 'next/link'
import {
  Center,
  Group,
  Burger,
  rem,
  Image,
  Space,
  Anchor,
  Title,
  Stack,
  Container,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Cormorant_SC } from 'next/font/google'
import { Tabs } from './tabs'
import { MobileMenu } from './mobile-menu'
import styles from './header.module.scss'

const cormorantSc = Cormorant_SC({
  subsets: ['latin'],
  weight: '700',
})

export function Header() {
  const [opened, { close, open }] = useDisclosure()
  return (
    <>
      <Container
        w="100%"
        size="xl"
        px="md"
        pt="sm"
        h={{ base: rem(160), md: rem(200), xl: rem(160) }}
        pos="relative"
      >
        <Group pb={10} pos="relative">
          <Burger hiddenFrom="md" opened={opened} onClick={open} />
          <Center style={{ flexGrow: 1 }}>
            <Anchor underline="never" component={NextLink} href="/">
              <Stack align="center" gap="0.3rem">
                <Image
                  component={NextImage}
                  alt="Antiques"
                  width={295}
                  height={87.5}
                  src="/images/head-logo.png"
                  w="5rem"
                />
                <Title className={styles.title} c="black" ff={cormorantSc.style.fontFamily}>
                  Barometers Realm
                </Title>
              </Stack>
            </Anchor>
          </Center>
          <Space display={{ md: 'none' }} w={rem(30)} />
          <Tabs />
        </Group>
      </Container>
      <MobileMenu opened={opened} onClose={close} />
    </>
  )
}
