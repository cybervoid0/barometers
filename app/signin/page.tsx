import { Stack, Title, Center, Anchor } from '@mantine/core'
import Link from 'next/link'
import { SignInForm } from './signin-form'

export default function SignIn() {
  return (
    <Center>
      <Stack py="md" w="20rem" align="center" gap="lg">
        <Title lh="100%" order={2}>
          Sign In
        </Title>
        <SignInForm />
        <Anchor c="dark.4" component={Link} href="/register">
          Don&apos;t have an account?
        </Anchor>
      </Stack>
    </Center>
  )
}
