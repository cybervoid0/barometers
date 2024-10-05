'use client'

import React from 'react'
import NextImage from 'next/image'
import NextLink from 'next/link'
import { Group, Burger, Image, Anchor, Title, Container, Box, Flex } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Tabs } from './tabs'
import { MobileMenu } from './mobile-menu'
import styles from './header.module.scss'

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
                  <Title lh="100%" ta="right" fz={{ base: 'h3', sm: 'h1' }} c="black" fw={600}>
                    Barometers Realm
                  </Title>
                </Anchor>
                <Anchor underline="never" component={NextLink} href="/">
                  <Image
                    component={NextImage}
                    alt="Antiques"
                    width={236}
                    height={236}
                    src="/images/logo_circle.png"
                    w={{ base: '3rem', sm: '4rem' }}
                    h={{ base: '3rem', sm: '4rem' }}
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
