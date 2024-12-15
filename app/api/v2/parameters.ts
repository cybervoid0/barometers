import { type Prisma } from '@prisma/client'

// pagination page size
export const DEFAULT_PAGE_SIZE = 12

// which barometer fields to include in barometer group responses
export const select: Prisma.BarometerSelect = {
  name: true,
  date: true,
  slug: true,
  collectionId: true,
  manufacturer: {
    select: {
      name: true,
    },
  },
  category: {
    select: {
      name: true,
    },
  },
}
