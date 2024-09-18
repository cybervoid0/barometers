import { Stack, Text, Flex, Center, Image, Anchor, Box, Container } from '@mantine/core'
import NextImage from 'next/image'
import { email } from '@/app/constants'

export function Footer() {
  const cvImageSize = 60
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
          <Image
            component={NextImage}
            src="/images/cybervoid.jpeg"
            width={cvImageSize}
            w={cvImageSize}
            height={cvImageSize}
            h={cvImageSize}
            alt="Lamp"
          />
          <Text size="0.7rem" fw={600}>
            Created by CyberVoid
          </Text>
        </Stack>
        <Center style={{ flexGrow: 1 }}>
          <Box fw={500} w="max-content">
            <Text size="sm" display="inline" fw="inherit">
              &copy; {new Date().getFullYear()}
              {` `}
            </Text>
            <Anchor
              underline="always"
              display="inline"
              size="sm"
              fw="inherit"
              c="inherit"
              href={`mailto:${email}`}
            >
              Leo Shirokov
            </Anchor>
            <Text display="inline" size="sm" fw="inherit">
              {` `}& CyberVoid
            </Text>
          </Box>
        </Center>
      </Flex>
    </Container>
  )
}
