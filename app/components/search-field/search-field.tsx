'use client'

/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect } from 'react'
import { Box, TextInput, BoxProps, CloseButton, ActionIcon, ButtonGroup } from '@mantine/core'
import { useForm } from '@mantine/form'
import { isLength } from 'validator'
import { useRouter } from 'next/navigation'
import { IconSearch } from '@tabler/icons-react'
import sx from './search-field.module.scss'

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
  }, [queryString])

  const handleSearch = async ({ q }: QueryForm) => {
    const qs = q.trim()
    const query = new URLSearchParams({ q: qs })
    router.push(`/search?${query}`, { scroll: true })
  }
  return (
    <Box {...props} my="md" component="form" onSubmit={form.onSubmit(handleSearch)}>
      <ButtonGroup>
        <TextInput
          autoComplete="off"
          classNames={{ input: sx.input, root: sx.inputRoot }}
          placeholder="Enter your query"
          title="Fill in any barometer related word"
          required
          {...form.getInputProps('q')}
          rightSection={
            <CloseButton
              aria-label="Clear input"
              onClick={form.reset}
              style={{ display: form.values.q ? undefined : 'none' }}
            />
          }
        />
        <ActionIcon variant="filled" size="input-sm" type="submit" className={sx.searchButton}>
          <IconSearch />
        </ActionIcon>
      </ButtonGroup>
    </Box>
  )
}
