import 'server-only'

import { withPrisma } from '@/prisma/prismaClient'

export const getCountries = withPrisma(prisma =>
  prisma.country.findMany({
    orderBy: {
      name: 'asc',
    },
  }),
)

export type CountryListDTO = Awaited<ReturnType<typeof getCountries>>
