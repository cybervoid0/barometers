'use client'

import { CSSProperties, Select } from '@mantine/core'
import { usePathname, useRouter } from 'next/navigation'
import { SortValue, SortOptions } from '@/app/types'

interface SortProps {
  sortBy: SortValue
  direction?: 'asc' | 'dec'
  style?: CSSProperties
}

export default function Sort({ sortBy, style }: SortProps) {
  const router = useRouter()
  const pathName = usePathname()

  const handleSortChange = (value: string | null) => {
    if (value) {
      const path = pathName.split('/')
      router.push(path.slice(0, -2).concat(value).concat('1').join('/'))
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
