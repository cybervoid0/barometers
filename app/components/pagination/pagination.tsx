'use client'

import { Pagination as MantinePagination, PaginationProps } from '@mantine/core'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

export function Pagination(props: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const updateQueryParams = (key: string, value: string | number) => {
    const params = new URLSearchParams(searchParams?.toString() || '')
    params.set(key, String(value))
    return params.toString()
  }
  const handlePageChange = (newPage: number) => {
    const updatedQuery = updateQueryParams('page', newPage)
    router.push(`${pathname}?${updatedQuery}`)
  }
  return (
    <MantinePagination
      mt="lg"
      style={{
        alignSelf: 'center',
      }}
      c="dark"
      color="dark"
      onChange={handlePageChange}
      {...props}
    />
  )
}
