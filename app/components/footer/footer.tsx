import { Container, Group, Tooltip } from '@mantine/core'
import Link from 'next/link'
import { IconBrandInstagram, IconMail } from '@tabler/icons-react'
import { instagram, email } from '@/utils/constants'

export function Footer() {
  return (
    <Container size="xl" py="sm" w="100%">
      <Group py={{ base: 'sm', sm: 'md' }}>
        <div className="flex-grow text-center">
          <p className="mb-2 text-xs">
            By using this website, you agree to our{' '}
            <Link
              className="text-sm font-semibold hover:underline"
              href="/terms-and-conditions"
            >
              Terms & Conditions
            </Link>
          </p>

          <p className="text-xs">
            &copy; {new Date().getFullYear()}
            {` `} Leo Shirokov. All right reserved.
          </p>
        </div>
        {/* Social media links */}
        <div className="hidden gap-2 sm:flex">
          <Tooltip label="Instagram">
            <a
              aria-label="Instagram"
              target="_blank"
              href={instagram}
              className="w-6 text-neutral-800 no-underline transition-colors duration-300 ease-in-out hover:text-red-700"
            >
              <IconBrandInstagram />
            </a>
          </Tooltip>
          <Tooltip label="Email">
            <a
              aria-label="Email"
              target="_blank"
              href={`mailto:${email}`}
              className="w-6 text-neutral-800 no-underline transition-colors duration-300 ease-in-out hover:text-blue-600"
            >
              <IconMail />
            </a>
          </Tooltip>
        </div>
      </Group>
    </Container>
  )
}
