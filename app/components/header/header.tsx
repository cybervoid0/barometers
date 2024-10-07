'use client'

import React from 'react'
import NextLink from 'next/link'
import { Group, Burger, Anchor, Title, Container, Box, Flex } from '@mantine/core'
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
            <Group justify="space-between" gap="0.3rem" wrap="nowrap">
              <Box>
                <Burger size="sm" hiddenFrom="md" opened={opened} onClick={open} />
                <Tabs visibleFrom="md" />
              </Box>
              <Flex align="center" gap="md">
                <Anchor underline="never" component={NextLink} href="/">
                  <Title lh="100%" fz={{ base: 'h3', sm: 'h1' }} c="black" fw={500}>
                    Barometers Realm
                  </Title>
                </Anchor>

                <Anchor underline="never" component={NextLink} href="/">
                  {/* Logo image */}
                  <Box className={styles.logo} />
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
