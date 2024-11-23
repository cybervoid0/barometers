'use client'

import { Box, Center, Container, TextInput, UnstyledButton, Group } from '@mantine/core'
import { useForm } from '@mantine/form'
import { isLength } from 'validator'
import { useRouter } from 'next/navigation'
import { IconSearch } from '@tabler/icons-react'

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
      q: value =>
        isLength(value.trim(), { min: 1, max: 100 }) ? null : 'Allowed length 1-100 symbols',
    },
  })

  const handleSearch = async ({ q }: QueryForm) => {
    const qs = q.trim()
    const query = new URLSearchParams({ q: qs })
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
            title="Fill in any barometer related word"
            required
            {...form.getInputProps('q')}
            rightSection={
              <UnstyledButton type="submit">
                <Center>
                  <IconSearch />
                </Center>
              </UnstyledButton>
            }
          />
        </Box>
      </Group>
    </Container>
  )
}
