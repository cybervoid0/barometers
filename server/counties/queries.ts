import 'server-only'

import { cacheLife, cacheTag } from 'next/cache'
import { Tag } from '@/constants'
import { withPrisma } from '@/prisma/prismaClient'

export const getCountries = withPrisma(async prisma => {
  'use cache'
  cacheLife('max')
  cacheTag(Tag.countries)

  return prisma.country.findMany({
    orderBy: {
      name: 'asc',
    },
  })
})

export type CountryListDTO = Awaited<ReturnType<typeof getCountries>>
