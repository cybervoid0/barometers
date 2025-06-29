import NextLink from 'next/link'
import NextImage from 'next/image'
import {
  Group,
  Anchor,
  Title,
  Container,
  Box,
  Flex,
  Tooltip,
} from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'
import { Navigation } from './navigation'
import { getCategories } from '@/app/services'
import customImageLoader from '@/utils/image-loader'

// server component

export async function Header() {
  const categories = await getCategories()
  return (
    <>
      <Box className="h-[4.6rem] min-h-[4.6rem] sm:h-[6rem] sm:min-h-[6rem]">
        <Box className="fixed top-0 z-50 h-[4.6rem] min-h-[4.6rem] w-full bg-white sm:h-[6rem] sm:min-h-[6rem]">
          <Container h="100%" size="xl">
            <Group className="h-full !flex-nowrap !justify-between !gap-1">
              <Group>
                <Navigation categories={categories} />
                <Tooltip color="primary" label="Search Barometers">
                  <Anchor
                    visibleFrom="md"
                    c="dark"
                    component={NextLink}
                    href="/search"
                  >
                    <IconSearch size={19} />
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
                      unoptimized
                      fill
                      src={customImageLoader({
                        src: '/shared/logo-arrow.png',
                        quality: 60,
                        width: 48,
                      })}
                      alt="logo"
                      className="object-contain"
                    />
                  </Box>
                </Flex>
              </Anchor>
            </Group>
          </Container>
        </Box>
      </Box>
    </>
  )
}
