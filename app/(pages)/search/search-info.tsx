'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { SearchField } from '@/components/elements'

interface SearchInfoProps {
  isEmptyResult: boolean
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

export function SearchInfo({ isEmptyResult }: SearchInfoProps) {
  const searchParams = useSearchParams()

  const [msg, setMsg] = useState<keyof typeof message>('welcome')

  useEffect(() => {
    const queryString = searchParams.get('q')
    setMsg(isEmptyResult ? (!queryString ? 'welcome' : 'notFound') : 'hidden')
  }, [searchParams, isEmptyResult])

  return (
    <div className="flex flex-col space-y-4">
      <SearchField className="px-4 md:px-0" />
      <p className={`${titleClasses[msg]} text-sm font-normal md:text-base`}>{message[msg]}</p>
    </div>
  )
}
