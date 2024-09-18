'use client'

import NextImage from 'next/image'
import NextLink from 'next/link'
import { Group, Burger, Image, Anchor, Title, Stack, Container, Box, Flex } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Cormorant_SC } from 'next/font/google'
import { FC, PropsWithChildren } from 'react'
import { Tabs } from './tabs'
import { MobileMenu } from './mobile-menu'
import styles from './header.module.scss'

const cormorantSc = Cormorant_SC({
  subsets: ['latin'],
  weight: '700',
})

const HeaderProportions: FC<PropsWithChildren> = ({ children }) => (
  <Box className={styles.proportions}>{children}</Box>
)

export function Header() {
  const [opened, { close, open }] = useDisclosure()
  return (
    <>
      <Box
        h="100%"
        mih={{ base: '6.9rem', sm: '10rem', md: '12.5rem', xl: '10rem' }}
        style={{ border: '3px dotted red' }}
      >
        <Box className={styles.container} style={{ border: '1px dotted red' }}>
          <Container size="xl">
            <Group pos="relative">
              <Burger pos="absolute" hiddenFrom="md" opened={opened} onClick={open} />
              <Tabs pos="absolute" visibleFrom="xl" />
              <Stack style={{ flexGrow: 1 }}>
                <Anchor underline="never" component={NextLink} href="/">
                  <Flex
                    direction={{ base: 'row', sm: 'column' }}
                    align="center"
                    justify="center"
                    gap="0.3rem"
                  >
                    <Image
                      component={NextImage}
                      alt="Antiques"
                      width={295}
                      height={87.5}
                      src="/images/head-logo.png"
                      w={{ base: '3rem', sm: '5rem' }}
                      h={{ base: '3rem', sm: '5rem' }}
                    />
                    <Title
                      fz={{ base: 'h3', sm: 'h1' }}
                      c="black"
                      ff={cormorantSc.style.fontFamily}
                    >
                      Barometers Realm
                    </Title>
                  </Flex>
                </Anchor>
                <Tabs visibleFrom="md" hiddenFrom="xl" />
              </Stack>
            </Group>
          </Container>
        </Box>
      </Box>
      <MobileMenu opened={opened} onClose={close} />
    </>
  )
}
