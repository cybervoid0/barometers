import { IBarometer } from '@/models/barometer'

export interface PaginationDTO {
  barometers: IBarometer[]
  totalItems: number
  totalPages: number
  page: number
  pageSize: number
}

// pagination page size
export const DEFAULT_PAGE_SIZE = 12
