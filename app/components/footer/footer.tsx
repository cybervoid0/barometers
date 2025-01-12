import { Anchor, Box, Container, Group, Text, Tooltip } from '@mantine/core'
import Link from 'next/link'
import { IconBrandInstagram, IconMail } from '@tabler/icons-react'
import { instagram, email } from '@/utils/constants'
import sx from './styles.module.scss'

export function Footer() {
  return (
    <Container size="xl" py="sm" w="100%">
      <Group py={{ base: 'sm', sm: 'md' }}>
        <Box className={sx.textBlock}>
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
      </Group>
    </Container>
  )
}
