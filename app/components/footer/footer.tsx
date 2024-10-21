import {
  Anchor,
  Box,
  Center,
  Container,
  Flex,
  Group,
  Image,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core'
import Link from 'next/link'
import NextImage from 'next/image'
import { IconBrandInstagram, IconMail } from '@tabler/icons-react'
import { instagram, email } from '@/app/constants'
import sx from './styles.module.scss'

export function Footer() {
  const cvImageSize = 45
  return (
    <Container size="xl" w="100%">
      <Flex
        py={{ base: 'sm', sm: 'md' }}
        align="center"
        direction={{ base: 'column', xs: 'row' }}
        component="footer"
        gap={{ base: 'sm', xs: 0 }}
      >
        <Stack w="10rem" align="center" gap={0}>
          <Anchor href="https://github.com/shenshin">
            <Image
              component={NextImage}
              src="/images/cybervoid.jpeg"
              width={cvImageSize}
              w={cvImageSize}
              height={cvImageSize}
              h={cvImageSize}
              alt="Lamp"
            />
          </Anchor>
          <Text size="0.7rem" fw={600}>
            Created by CyberVoid
          </Text>
        </Stack>
        <Center style={{ flexGrow: 1, flexDirection: 'column' }}>
          <Box fw={500} w="max-content">
            <Text size="xs" display="inline" fw="inherit">
              By using this website, you agree to our{' '}
              <Anchor fw="600" c="dark" component={Link} href="/terms-and-conditions">
                <Text size="sm" component="span" fw="inherit">
                  Terms&Conditions
                </Text>
              </Anchor>
            </Text>
          </Box>
          <Box fw={500} w="max-content">
            <Text size="sm" display="inline" fw="inherit">
              &copy; {new Date().getFullYear()}
              {` `} Leo Shirokov. All right reserved.
            </Text>
          </Box>
        </Center>
        {/* Social media links */}
        <Group gap="xs" visibleFrom="sm" className={sx.container}>
          <Tooltip label="Instagram">
            <Anchor
              underline="never"
              aria-label="Instagram"
              target="_blank"
              href={instagram}
              className={sx.smallButton}
            >
              <IconBrandInstagram />
            </Anchor>
          </Tooltip>
          <Tooltip label="Email">
            <Anchor
              underline="never"
              aria-label="Email"
              target="_blank"
              href={`mailto:${email}`}
              className={sx.mailButton}
            >
              <IconMail />
            </Anchor>
          </Tooltip>
        </Group>
      </Flex>
    </Container>
  )
}
