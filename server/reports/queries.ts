import 'server-only'

import { DEFAULT_PAGE_SIZE } from '@/constants'
import { prisma } from '@/prisma/prismaClient'

export async function getInaccuracyReports(pageNo: number, pageSize: number) {
  const size = Math.max(pageSize || DEFAULT_PAGE_SIZE, 1)
  const page = Math.max(pageNo || 1, 1)
  const [reports, totalItems] = await Promise.all([
    prisma.inaccuracyReport.findMany({
      skip: (page - 1) * size,
      take: size,
      orderBy: [{ createdAt: 'desc' }, { reporterName: 'desc' }],
      include: {
        barometer: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    }),
    prisma.inaccuracyReport.count(),
  ])
  return {
    reports,
    page,
    totalItems,
    pageSize: size,
    totalPages: Math.ceil(totalItems / size),
  }
}

export type InaccuracyReportsDTO = Awaited<ReturnType<typeof getInaccuracyReports>>
