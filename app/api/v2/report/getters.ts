import { withPrisma } from '@/prisma/prismaClient'

export const getInaccuracyReportList = withPrisma(
  async (prisma, page: number, pageSize: number) => {
    const [reports, totalItems] = await Promise.all([
      prisma.inaccuracyReport.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
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
      pageSize,
      totalPages: Math.ceil(totalItems / pageSize),
    }
  },
)

export type InaccuracyReportListDTO = Awaited<ReturnType<typeof getInaccuracyReportList>>
