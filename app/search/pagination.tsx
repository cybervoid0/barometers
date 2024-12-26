'use client'

import { Pagination as MantinePagination, PaginationProps } from '@mantine/core'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

export function Pagination(props: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(newPage))
    router.push(`${pathname}?${params}`)
  }
  return <MantinePagination onChange={handlePageChange} {...props} />
}
