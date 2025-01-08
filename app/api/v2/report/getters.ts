import { withPrisma } from '@/prisma/prismaClient'

export const getInaccuracyReportList = withPrisma(
  async (prisma, page: number, pageSize: number) => {
    const [reports, totalItems] = await Promise.all([
      prisma.inaccuracyReport.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          issueType: true,
          status: true,
          barometer: {
            select: {
              id: true,
              name: true,
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

export const getInaccuracyReport = withPrisma(async (prisma, id: string) =>
  prisma.inaccuracyReport.findUniqueOrThrow({
    where: { id },
    select: {
      issueType: true,
      createdAt: true,
      description: true,
      reporterEmail: true,
      status: true,
      barometer: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  }),
)

export type InaccuracyReportDTO = Awaited<ReturnType<typeof getInaccuracyReport>>
