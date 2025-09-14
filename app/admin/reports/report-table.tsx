'use client'

import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import dayjs from 'dayjs'
import Link from 'next/link'
import { Table } from '@/components/elements'
import { FrontRoutes } from '@/constants'
import type { InaccuracyReportsDTO } from '@/lib/reports/queries'

interface Props {
  reports: InaccuracyReportsDTO['reports']
}

export function ReportTable({ reports }: Props) {
  const { accessor } = createColumnHelper<InaccuracyReportsDTO['reports'][number]>()
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
    data: reports ?? [],
    getCoreRowModel: getCoreRowModel(),
  })
  return <Table table={table} />
}
