import { Pagination } from '@/components/ui'
import { getInaccuracyReports } from '@/server/reports/queries'
import type { DynamicOptions } from '@/types'
import { ReportTable } from './report-table'

export const dynamic: DynamicOptions = 'force-dynamic'
const itemsOnPage = 12

interface Props {
  searchParams: Promise<{ page: string }>
}

export default async function ReportList({ searchParams }: Props) {
  const { page } = await searchParams
  const pageNo = Number.parseInt(page, 10) || 1
  const { reports, totalPages } = await getInaccuracyReports(pageNo, itemsOnPage)

  return (
    <>
      <h3 className="my-4">Inaccuracy Reports</h3>
      <ReportTable reports={reports} />
      <Pagination className="mx-auto mt-4" value={pageNo} total={totalPages ?? 1} />
    </>
  )
}
