import 'server-only'

import { cacheLife, cacheTag } from 'next/cache'
import { Tag } from '@/constants'
import { prisma } from '@/prisma/prismaClient'

export async function getCountries() {
  'use cache'
  cacheLife('max')
  cacheTag(Tag.countries)

  return prisma.country.findMany({
    orderBy: {
      name: 'asc',
    },
  })
}

export type CountryListDTO = Awaited<ReturnType<typeof getCountries>>
