'use client'

import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  useReactTable,
} from '@tanstack/react-table'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { FileText } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Image, Table } from '@/components/elements'
import { Badge, Pagination } from '@/components/ui'
import { DEFAULT_PAGE_SIZE, Route } from '@/constants'
import type { AllDocumentsDTO } from '@/server/documents/queries'

dayjs.extend(utc)
interface Props {
  archive: AllDocumentsDTO
}
type TableRow = AllDocumentsDTO[number]
const { accessor } = createColumnHelper<TableRow>()
const columns = [
  accessor('images', {
    enableSorting: false,
    header: 'Preview',
    id: 'images',
    cell: info => {
      const image = info.getValue().at(0)
      return image ? (
        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted">
          <Image
            src={image.url}
            fill
            className="object-cover"
            alt={image.name ?? info.row.original.title}
          />
        </div>
      ) : (
        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
          <FileText className="w-6 h-6 text-muted-foreground" />
        </div>
      )
    },
  }),
  accessor('catalogueNumber', {
    header: 'Cat.No.',
    id: 'catalogue',
    cell: info => (
      <Badge variant="outline" className="font-mono text-xs">
        {info.getValue()}
      </Badge>
    ),
  }),
  accessor('title', {
    header: 'Document',
    id: 'title',
    cell: info => (
      <div className="space-y-1">
        <p className="font-medium leading-tight">{info.getValue()}</p>
        <p className="text-xs text-muted-foreground">{info.row.original.documentType}</p>
      </div>
    ),
  }),
  accessor('createdAt', {
    header: 'Added',
    id: 'created',
    cell: info => (
      <div className="text-sm text-muted-foreground">
        {dayjs.utc(info.getValue()).format('MMM D, YYYY')}
      </div>
    ),
    sortingFn: (a, b) =>
      dayjs.utc(a.original.createdAt).unix() - dayjs.utc(b.original.createdAt).unix(),
  }),
]

function DocumentTable({ archive = [] }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentPage = Number(searchParams.get('page')) || 1
  const [pagination, setPagination] = useState<PaginationState>({
    pageSize: DEFAULT_PAGE_SIZE,
    pageIndex: currentPage - 1,
  })
  // sync page search param with table pagination state
  useEffect(() => setPagination(old => ({ ...old, pageIndex: currentPage - 1 })), [currentPage])

  const table = useReactTable({
    columns,
    data: archive,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination,
    },
    enableSorting: true,
    autoResetPageIndex: false,
  })

  const selectRow = (row: TableRow) => {
    router.push(Route.Documents + encodeURIComponent(row.catalogueNumber))
  }

  return (
    <div className="space-y-4">
      <Table table={table} onRowClick={selectRow} />

      {table.getPageCount() > 1 && (
        <Pagination
          className="mt-4"
          total={table.getPageCount()}
          value={table.getState().pagination.pageIndex + 1}
        />
      )}
    </div>
  )
}

export { DocumentTable }
