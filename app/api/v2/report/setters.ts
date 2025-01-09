import { withPrisma } from '@/prisma/prismaClient'

export const createReport = withPrisma(
  async (
    prisma,
    barometerId: string,
    reporterEmail: string,
    reporterName: string,
    description: string,
  ) => {
    const newReport = await prisma.inaccuracyReport.create({
      data: {
        barometerId,
        reporterEmail,
        reporterName,
        description,
      },
    })
    return { id: newReport.id }
  },
)
