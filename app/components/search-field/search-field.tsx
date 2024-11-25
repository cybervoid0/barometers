'use client'

/* eslint-disable react-hooks/exhaustive-deps */

import { Box, Center, TextInput, UnstyledButton, BoxProps } from '@mantine/core'
import { useForm } from '@mantine/form'
import { isLength } from 'validator'
import { useRouter } from 'next/navigation'
import { IconSearch } from '@tabler/icons-react'
import { useEffect } from 'react'

interface SearchProps extends BoxProps {
  queryString?: string
}

interface QueryForm extends Record<string, string> {
  q: string
}

export function SearchField({ queryString, ...props }: SearchProps) {
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

  // fill querystring from the page to the form
  useEffect(() => {
    if (!queryString) return
    form.setValues({ q: queryString })
    form.resetDirty({ q: queryString })
  }, [queryString])

  const handleSearch = async ({ q }: QueryForm) => {
    const qs = q.trim()
    const query = new URLSearchParams({ q: qs })
    router.push(`/search?${query}`)
  }
  return (
    <Box
      {...props}
      my="md"
      px={{ base: 'lg', xs: 0 }}
      component="form"
      onSubmit={form.onSubmit(handleSearch)}
    >
      <TextInput
        style={{ overflow: 'hidden' }}
        styles={{
          input: {
            fontSize: '1rem',
          },
        }}
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
  )
}
