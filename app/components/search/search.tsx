'use client'

import { Box, Center, Container, TextInput, UnstyledButton, Group } from '@mantine/core'
import { useForm } from '@mantine/form'
import { isLength } from 'validator'
import { useRouter } from 'next/navigation'
import { IconSend2 } from '@tabler/icons-react'

interface QueryForm extends Record<string, string> {
  q: string
}

export function Search() {
  const router = useRouter()
  const form = useForm<QueryForm>({
    initialValues: {
      q: '',
    },
    validate: {
      q: value => (isLength(value, { min: 1, max: 100 }) ? null : 'Allowed length 1-100 symbols'),
    },
  })

  const handleSearch = async (values: QueryForm) => {
    const query = new URLSearchParams(values)
    router.push(`/search?${query}`)
  }
  return (
    <Container size="xl">
      <Group py="md" justify="flex-end">
        <Box
          px={{ base: 'lg', xs: 0 }}
          w={{ base: '100%', xs: 'calc(50% - 1.25rem)', lg: 'calc(33% - 1.25rem)' }}
          component="form"
          onSubmit={form.onSubmit(handleSearch)}
        >
          <TextInput
            placeholder="Find barometer"
            required
            {...form.getInputProps('q')}
            rightSection={
              <UnstyledButton type="submit">
                <Center>
                  <IconSend2 />
                </Center>
              </UnstyledButton>
            }
          />
        </Box>
      </Group>
    </Container>
  )
}
