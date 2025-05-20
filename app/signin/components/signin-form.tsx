'use client'

import { signIn } from 'next-auth/react'
import { Button, TextInput, PasswordInput, Box, Stack } from '@mantine/core'
import { IconAt } from '@tabler/icons-react'
import { useForm } from '@mantine/form'
import { isEmail } from 'validator'
import { useRouter } from 'next/navigation'
import { showError, showInfo } from '@/utils/notification'

export function SignInForm() {
  const router = useRouter()
  const form = useForm({
    name: 'sign-in',
    mode: 'uncontrolled',
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (val: string) => (isEmail(val) ? null : 'invalid email'),
    },
  })

  const handleSignIn = async (values: typeof form.values) => {
    const res = await signIn('credentials', {
      email: values.email,
      password: values.password,
      redirect: false,
    })
    if (res?.ok) {
      showInfo('You have successfully logged in.', 'Log In')
      router.push('/admin')
    }
    if (res?.error) {
      showError(res.error)
    }
  }
  return (
    <Box w="100%" component="form" onSubmit={form.onSubmit(handleSignIn)}>
      <Stack gap="lg">
        <Box>
          <TextInput
            required
            label="E-mail"
            id="email"
            key={form.key('email')}
            {...form.getInputProps('email')}
            rightSection={<IconAt size={16} />}
          />
          <PasswordInput
            required
            label="Password"
            id="password"
            key={form.key('password')}
            {...form.getInputProps('password')}
            description="Min 8 symbols"
            inputWrapperOrder={['label', 'input', 'description', 'error']}
            styles={{
              wrapper: {
                marginBottom: 0,
              },
            }}
          />
        </Box>
        <Button h="2rem" type="submit" color="black" variant="outline">
          Sign In
        </Button>
      </Stack>
    </Box>
  )
}
