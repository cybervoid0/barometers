'use client'

import { Pagination as MantinePagination, PaginationProps } from '@mantine/core'
import { useRouter, usePathname } from 'next/navigation'

export function Pagination(props: PaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const handlePageChange = (newPage: number) => {
    router.push(pathname.split('/').slice(0, -1).concat(`${newPage}`).join('/'))
  }
  return <MantinePagination onChange={handlePageChange} {...props} />
}
