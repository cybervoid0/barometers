'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useId } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SortOptions, type SortValue } from '@/types'
import { cn } from '@/utils'

interface SortProps {
  sortBy: SortValue
  direction?: 'asc' | 'dec'
  className?: string
}

export default function Sort({ sortBy, className }: SortProps) {
  const router = useRouter()
  const pathName = usePathname()
  const triggerId = useId()

  const handleSortChange = (value: string) => {
    const path = pathName.split('/')
    router.push(path.slice(0, -2).concat(value).concat('1').join('/'))
  }

  return (
    <div className={cn('space-y-1', className)}>
      <label htmlFor={triggerId} className="text-muted-foreground text-xs font-medium">
        Sort by
      </label>
      <Select value={sortBy} onValueChange={handleSortChange}>
        <SelectTrigger id={triggerId} className="w-full text-xs capitalize">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {SortOptions.map(option => (
            <SelectItem
              key={typeof option === 'string' ? option : option.value}
              value={typeof option === 'string' ? option : option.value}
              className="capitalize"
            >
              {typeof option === 'string' ? option : option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
