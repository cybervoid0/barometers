'use client'

import NextImage from 'next/image'
import NextLink from 'next/link'
import { Center, Group, Burger, Image, Anchor, Title, Stack, Container } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Cormorant_SC } from 'next/font/google'
import { Tabs } from './tabs'
import { MobileMenu } from './mobile-menu'

const cormorantSc = Cormorant_SC({
  subsets: ['latin'],
  weight: '700',
})

export function Header() {
  const [opened, { close, open }] = useDisclosure()
  return (
    <>
      <Container w="100%" mb={{ md: '2.6rem', xl: 0 }} size="xl" px="md" pt="sm" pos="relative">
        <Group pb="md" pos="relative">
          <Burger pos="absolute" hiddenFrom="md" opened={opened} onClick={open} />
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
                <Title c="black" ff={cormorantSc.style.fontFamily}>
                  Barometers Realm
                </Title>
              </Stack>
            </Anchor>
          </Center>

          <Tabs />
        </Group>
      </Container>
      <MobileMenu opened={opened} onClose={close} />
    </>
  )
}
