'use client'

import { useState, useEffect } from 'react'
import { SearchField } from '../components/search-field'

interface SearchInfoProps {
  isEmptyResult: boolean
  queryString: string
}

const message = {
  welcome: 'Start your search for timeless barometers.',
  notFound: 'No results found for your query.',
  hidden: '',
} as const satisfies Record<string, string>

const titleClasses = {
  welcome: 'block text-muted-foreground',
  notFound: 'block text-destructive',
  hidden: 'hidden',
} as const

export function SearchInfo({ isEmptyResult, queryString }: SearchInfoProps) {
  const [msg, setMsg] = useState<keyof typeof message>('welcome')

  useEffect(() => {
    setMsg(isEmptyResult ? (!queryString ? 'welcome' : 'notFound') : 'hidden')
  }, [queryString, isEmptyResult])

  return (
    <div className="flex flex-col space-y-4">
      <SearchField queryString={queryString} className="px-4 md:px-0" />
      <p className={`${titleClasses[msg]} text-sm font-normal md:text-base`}>{message[msg]}</p>
    </div>
  )
}
