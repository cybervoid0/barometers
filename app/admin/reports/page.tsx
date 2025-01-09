'use client'

import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useReactTable, createColumnHelper, getCoreRowModel } from '@tanstack/react-table'
import { Anchor, Container, Title } from '@mantine/core'
import dayjs from 'dayjs'
import { fetchReportList } from '@/utils/fetch'
import { InaccuracyReportListDTO } from '@/app/types'
import { barometerRoute } from '@/app/constants'
import { Table } from '@/app/components/table'

export default function ReportList() {
  const searchParams = useSearchParams()
  const { data } = useQuery({
    queryKey: ['inaccuracyReport'],
    queryFn: () => fetchReportList(Object.fromEntries(searchParams.entries())),
  })
  const { accessor } = createColumnHelper<InaccuracyReportListDTO['reports'][number]>()
  const columns = [
    accessor('barometer.name', {
      header: 'Barometer',
      cell: info => (
        <Anchor
          size="sm"
          c="dark"
          href={barometerRoute + info.row.original.barometer.slug}
          component={Link}
        >
          {info.getValue()}
        </Anchor>
      ),
    }),
    accessor('reporterName', {
      header: 'Name',
    }),
    accessor('reporterEmail', {
      header: 'Email',
      cell: info => (
        <Anchor size="sm" c="dark" href={`mailto:${info.getValue()}`}>
          {info.getValue()}
        </Anchor>
      ),
    }),
    accessor('createdAt', {
      header: 'Created at',
      cell: info => dayjs(info.getValue()).format('MMMM D, YYYY'),
    }),
    accessor('description', {
      header: 'Description',
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
    <Container size="xl">
      <Title my="lg">Inaccuracy Reports</Title>
      <Table table={table} />
    </Container>
  )
}
