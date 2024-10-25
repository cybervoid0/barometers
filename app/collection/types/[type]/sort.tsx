'use client'

import { Select } from '@mantine/core'
import { useRouter } from 'next/navigation'
import { SortOptions } from './types'

interface SortProps {
  sortBy: SortOptions
  direction?: 'asc' | 'dec'
}

export default function Sort({ sortBy }: SortProps) {
  const router = useRouter()

  const handleSortChange = (value: string | null) => {
    if (value) {
      router.push(`?${new URLSearchParams({ sort: value })}`)
    }
  }

  return (
    <Select
      size="xs"
      label="Sort by"
      placeholder="Sort by"
      value={sortBy}
      onChange={handleSortChange}
      data={Object.keys(SortOptions)}
      styles={{
        option: { textTransform: 'capitalize' },
        input: { textTransform: 'capitalize' },
      }}
    />
  )
}
