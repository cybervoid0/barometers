'use client'

import { CSSProperties, Select } from '@mantine/core'
import { useRouter } from 'next/navigation'
import { SortValue, SortOptions } from './types'

interface SortProps {
  sortBy: SortValue
  direction?: 'asc' | 'dec'
  style?: CSSProperties
}

export default function Sort({ sortBy, style }: SortProps) {
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
      data={SortOptions}
      styles={{
        root: style,
        option: { textTransform: 'capitalize' },
        input: { textTransform: 'capitalize' },
      }}
    />
  )
}
