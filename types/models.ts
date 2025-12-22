import type { AccessRole, Prisma } from '@prisma/client'

export interface MenuItem {
  id: number | string
  label: string
  link: string
  visibleFor?: AccessRole
  children?: MenuItem[]
}

/**
 * Barometer dimensions database JSON structure
 */
export type Dimensions = { dim: string; value: string }[]

export interface BarometerFormProps {
  collectionId: string
  name: string
  categoryId: string
  date: string
  dateDescription: string
  manufacturerId: string
  conditionId: string
  description: string
  dimensions: Dimensions
  images: string[]
}

export const SortOptions = [
  { value: 'name', label: 'Name' },
  { value: 'date', label: 'Dating' },
  { value: 'manufacturer', label: 'Manufacturer' },
  { value: 'last-added', label: 'Last added' },
] as const satisfies { value: string; label: string }[]

export type SortValue = (typeof SortOptions)[number]['value']
export interface CookieTable extends Record<string, string> {
  name: string
  domain: string
  description: string
  expiration: string
}

export enum ImageType {
  Barometer = 'b',
  Brand = 'm',
  Category = 'c',
  Document = 'd',
}

export interface MediaFile {
  url: string
  name: string
}

export type ProductWithImages = Prisma.ProductGetPayload<{
  include: { images: true; variants: true; options: true }
}>

export type ProductVariantWithProduct = Prisma.ProductVariantGetPayload<{
  include: { product: { include: { images: true } }; images: true }
}>
