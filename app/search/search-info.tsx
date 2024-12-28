'use client'

import { useState, useEffect } from 'react'
import { Stack, Title } from '@mantine/core'
import { SearchField } from '../components/search-field'
import sx from './style.module.css'

interface SearchInfoProps {
  isEmptyResult: boolean
  queryString: string
}

const message = {
  welcome: 'Start your search for timeless barometers.',
  notFound: 'No results found for your query.',
  hidden: '',
} as const satisfies Record<string, string>

export function SearchInfo({ isEmptyResult, queryString }: SearchInfoProps) {
  const [msg, setMsg] = useState<keyof typeof message>('welcome')

  useEffect(() => {
    setMsg(isEmptyResult ? (!queryString ? 'welcome' : 'notFound') : 'hidden')
  }, [queryString, isEmptyResult])

  return (
    <Stack>
      <SearchField px={{ base: 'lg', xs: 0 }} queryString={queryString} />
      <Title className={sx[msg]} fw={400} fz={{ base: '0.8rem', sm: '1rem' }} component="p">
        {message[msg]}
      </Title>
    </Stack>
  )
}
