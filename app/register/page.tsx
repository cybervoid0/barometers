'use client'

import { useRouter } from 'next/navigation'
import { Button, Stack, Title, TextInput, PasswordInput, Center, Box } from '@mantine/core'
import { IconAt, IconUser } from '@tabler/icons-react'
import { isEmail, isLength } from 'validator'
import { useForm } from '@mantine/form'
import { register } from '@/actions/register'
import { showError, showInfo } from '@/utils/notification'

export default function Register() {
  const router = useRouter()
  const form = useForm({
    name: 'register',
    initialValues: {
      name: '',
      email: '',
      password: '',
      repeatPassword: '',
    },
    validate: {
      name: val => (isLength(val, { min: 2, max: 50 }) ? null : 'name should be 2-50 symbols long'),
      email: val => (isEmail(val) ? null : 'invalid email'),
      password: val =>
        isLength(val, {
          min: 6,
        })
          ? null
          : 'should be at least 6 symbols long',
      repeatPassword: (val, { password }) =>
        val && val === password ? null : 'passwords are not identical',
    },
  })

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await register(values)
      showInfo(`${values.name} was successfully registered`, 'User registration')
      router.push('/signin')
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Registration error')
    }
  }

  return (
    <Center>
      <Box component="form" onSubmit={form.onSubmit(handleSubmit)}>
        <Stack py="lg" gap="lg">
          <Box w="20rem">
            <Title ta="center" mb="xs" order={2}>
              Registration
            </Title>
            <TextInput
              required
              label="Name"
              id="name"
              rightSection={<IconUser size={16} />}
              key={form.key('name')}
              {...form.getInputProps('name')}
            />
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
            <PasswordInput
              required
              id="repeat-password"
              label="Repeat password"
              key={form.key('repeatPassword')}
              {...form.getInputProps('repeatPassword')}
            />
          </Box>

          <Button h="2rem" fullWidth type="submit" color="black" variant="outline">
            Sign up
          </Button>
        </Stack>
      </Box>
    </Center>
  )
}
