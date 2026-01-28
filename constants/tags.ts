export const Tag = {
  brands: 'brands',
  countries: 'countries',
  documents: 'documents',
} as const
export type Tag = (typeof Tag)[keyof typeof Tag]
