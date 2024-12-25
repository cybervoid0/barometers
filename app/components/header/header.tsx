'use client'

import React from 'react'
import NextLink from 'next/link'
import NextImage from 'next/image'
import { Group, Burger, Anchor, Title, Container, Box, Flex, Tooltip } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconSearch } from '@tabler/icons-react'
import { Tabs } from './tabs'
import { MobileMenu } from './mobile-menu'
import styles from './header.module.scss'

export function Header() {
  const [opened, { close, open }] = useDisclosure()
  return (
    <>
      <Box className={styles.indent}>
        <Box className={styles.container}>
          <Container h="100%" size="xl">
            <Group h="100%" justify="space-between" gap="0.3rem" wrap="nowrap">
              <Group>
                <Box>
                  <Burger size="md" hiddenFrom="md" opened={opened} onClick={open} />
                  <Tabs visibleFrom="md" />
                </Box>
                <Tooltip color="primary" label="Search Barometers">
                  <Anchor c="dark" component={NextLink} href="/search">
                    <IconSearch size="1.2rem" />
                  </Anchor>
                </Tooltip>
              </Group>
              <Anchor underline="never" component={NextLink} href="/">
                <Flex align="center" gap="xs">
                  <Title className={styles.title}>Barometers Realm</Title>
                  {/* Logo image */}
                  <Box className={styles.logo}>
                    <NextImage
                      fill
                      quality={40}
                      src="/images/logo-arrow.png"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      alt="logo"
                      style={{ objectFit: 'contain' }}
                    />
                  </Box>
                </Flex>
              </Anchor>
            </Group>
          </Container>
        </Box>
      </Box>
      <MobileMenu opened={opened} onClose={close} />
    </>
  )
}
