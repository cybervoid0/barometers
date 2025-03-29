'use client'

import React from 'react'
import NextLink from 'next/link'
import NextImage from 'next/image'
import { Group, Burger, Anchor, Title, Container, Box, Flex, Tooltip } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconSearch } from '@tabler/icons-react'
import { Tabs } from './tabs'
import { MobileMenu } from './mobile-menu'

export function Header() {
  const [opened, { close, open }] = useDisclosure()
  return (
    <>
      <Box className="h-[4.6rem] min-h-[4.6rem] sm:h-[6rem] sm:min-h-[6rem]">
        <Box className="fixed top-0 z-50 h-[4.6rem] min-h-[4.6rem] w-full bg-white sm:h-[6rem] sm:min-h-[6rem]">
          <Container h="100%" size="xl">
            <Group h="100%" justify="space-between" gap="0.3rem" wrap="nowrap">
              <Group>
                <Box>
                  <Burger size="md" hiddenFrom="md" opened={opened} onClick={open} />
                  <Tabs visibleFrom="md" />
                </Box>
                <Tooltip color="primary" label="Search Barometers">
                  <Anchor visibleFrom="md" c="dark" component={NextLink} href="/search">
                    <IconSearch size="1.2rem" />
                  </Anchor>
                </Tooltip>
              </Group>
              <Anchor underline="never" component={NextLink} href="/">
                <Flex align="center" gap="xs">
                  <Title
                    unstyled
                    className="text-[1.3rem] font-semibold uppercase leading-none tracking-wider text-black sm:text-[1.4rem] lg:text-[1.6rem] xl:text-[1.8rem]"
                  >
                    Barometers Realm
                  </Title>
                  {/* Logo image */}
                  <Box className="relative aspect-square h-10 sm:h-12">
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
