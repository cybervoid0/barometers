'use client'

import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useReactTable, createColumnHelper, getCoreRowModel } from '@tanstack/react-table'
import { Anchor, Box, Center, Container, Title } from '@mantine/core'
import dayjs from 'dayjs'
import { fetchReportList } from '@/utils/fetch'
import { InaccuracyReportListDTO } from '@/app/types'
import { barometerRoute } from '@/app/constants'
import { Table } from '@/app/components/table'
import { Pagination } from '@/app/components/pagination'

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
      cell: info => dayjs(info.getValue()).format('MMMM D, YYYY HH:mm'),
    }),
    accessor('description', {
      header: 'Description',
      cell: info => <Box miw="20rem">{info.getValue()}</Box>,
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
      <Box style={{ overflow: 'scroll' }}>
        <Table table={table} />
      </Box>
      <Center>
        <Pagination value={+page} total={data?.totalPages ?? 1} />
      </Center>
    </Container>
  )
}
