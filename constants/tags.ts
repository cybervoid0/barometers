export const Tag = {
  brands: 'brands',
  countries: 'countries',
  documents: 'documents',
  barometers: 'barometers',
  conditions: 'conditions',
  materials: 'materials',
  movements: 'movements',
} as const
export type Tag = (typeof Tag)[keyof typeof Tag]
