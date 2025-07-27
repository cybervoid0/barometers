import { Anchor, Box, Container, Group, Text, Tooltip } from '@mantine/core'
import Link from 'next/link'
import { IconBrandInstagram, IconMail } from '@tabler/icons-react'
import { instagram, email } from '@/utils/constants'

export function Footer() {
  return (
    <Container size="xl" py="sm" w="100%">
      <Group py={{ base: 'sm', sm: 'md' }}>
        <Box className="flex-grow text-center">
          <Text mb="0.5rem" size="xs">
            By using this website, you agree to our{' '}
            <Anchor
              underline="hover"
              fw="600"
              c="dark"
              component={Link}
              href="/terms-and-conditions"
            >
              Terms & Conditions
            </Anchor>
          </Text>

          <Text size="xs">
            &copy; {new Date().getFullYear()}
            {` `} Leo Shirokov. All right reserved.
          </Text>
        </Box>
        {/* Social media links */}
        <Group gap="xs" visibleFrom="sm">
          <Tooltip label="Instagram">
            <a
              aria-label="Instagram"
              target="_blank"
              rel="noopener noreferrer"
              href={instagram}
              className="w-6 text-gray-600 transition-colors duration-300 ease-in-out hover:text-red-900"
            >
              <IconBrandInstagram />
            </a>
          </Tooltip>
          <Tooltip label="Email">
            <a
              aria-label="Email"
              target="_blank"
              rel="noopener noreferrer"
              href={`mailto:${email}`}
              className="w-6 text-gray-600 transition-colors duration-300 ease-in-out hover:text-blue-700"
            >
              <IconMail />
            </a>
          </Tooltip>
        </Group>
      </Group>
    </Container>
  )
}
