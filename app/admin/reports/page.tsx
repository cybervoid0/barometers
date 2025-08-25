'use client'

import { useQuery } from '@tanstack/react-query'
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import dayjs from 'dayjs'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Table } from '@/components/elements'
import { Pagination } from '@/components/ui'
import { FrontRoutes } from '@/constants'
import { fetchReportList } from '@/services'
import { InaccuracyReportListDTO } from '@/types'

const itemsOnPage = 6

export default function ReportList() {
  const searchParams = useSearchParams()
  const page = searchParams.get('page') ?? '1'
  const { data } = useQuery({
    queryKey: ['inaccuracyReport', page],
    queryFn: () =>
      fetchReportList({
        page,
        size: String(itemsOnPage),
      }),
  })
  const { accessor } = createColumnHelper<InaccuracyReportListDTO['reports'][number]>()
  const columns = [
    accessor('barometer.name', {
      header: 'Barometer',
      cell: info => (
        <Link
          href={FrontRoutes.Barometer + info.row.original.barometer.slug}
          className="text-foreground hover:text-primary text-sm hover:underline"
        >
          {info.getValue()}
        </Link>
      ),
    }),
    accessor('reporterName', {
      header: 'Name',
    }),
    accessor('reporterEmail', {
      header: 'Email',
      cell: info => (
        <a
          href={`mailto:${info.getValue()}`}
          className="text-foreground hover:text-primary text-sm hover:underline"
        >
          {info.getValue()}
        </a>
      ),
    }),
    accessor('createdAt', {
      header: 'Created at',
      cell: info => dayjs(info.getValue()).format('MMMM D, YYYY HH:mm'),
    }),
    accessor('description', {
      header: 'Description',
      cell: info => <div className="min-w-80">{info.getValue()}</div>,
    }),
    accessor('status', {
      header: 'Status',
    }),
  ]
  const table = useReactTable({
    columns,
    data: data?.reports ?? [],
    getCoreRowModel: getCoreRowModel(),
  })
  return (
    <>
      <h3 className="my-4">Inaccuracy Reports</h3>
      <Table table={table} />
      <Pagination className="mx-auto mt-4" value={+page} total={data?.totalPages ?? 1} />
    </>
  )
}
