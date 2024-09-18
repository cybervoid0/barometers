'use client'

import NextImage from 'next/image'
import NextLink from 'next/link'
import { Group, Burger, Image, Anchor, Title, Container, Box, Flex } from '@mantine/core'
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
      <Box className={styles.indent}>
        <Box className={styles.container}>
          <Container size="xl">
            <Group align="center" justify="space-between" gap="0.3rem">
              <Box>
                <Burger size="sm" hiddenFrom="md" opened={opened} onClick={open} />
                <Tabs visibleFrom="md" />
              </Box>
              <Flex align="center" gap="md">
                <Anchor underline="never" component={NextLink} href="/">
                  <Title
                    lh="100%"
                    ta="right"
                    fz={{ base: 'h3', sm: 'h1' }}
                    c="black"
                    ff={cormorantSc.style.fontFamily}
                  >
                    Barometers Realm
                  </Title>
                </Anchor>
                <Anchor underline="never" component={NextLink} href="/">
                  <Image
                    component={NextImage}
                    alt="Antiques"
                    width={295}
                    height={87.5}
                    src="/images/head-logo.png"
                    w={{ base: '3rem', sm: '5rem' }}
                    h={{ base: '3rem', sm: '5rem' }}
                  />
                </Anchor>
              </Flex>
            </Group>
          </Container>
        </Box>
      </Box>
      <MobileMenu opened={opened} onClose={close} />
    </>
  )
}
