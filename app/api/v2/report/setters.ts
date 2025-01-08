import { withPrisma } from '@/prisma/prismaClient'

export const createReport = withPrisma(
  async (
    prisma,
    barometerId: string,
    reporterEmail: string,
    issueType: string,
    description: string,
  ) => {
    const newReport = await prisma.inaccuracyReport.create({
      data: {
        barometerId,
        reporterEmail,
        issueType,
        description,
      },
    })
    return { id: newReport.id }
  },
)
