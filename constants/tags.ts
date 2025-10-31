export const Tag = {
  brands: 'brands',
  categories: 'categories',
  countries: 'countries',
  documents: 'documents',
  barometers: 'barometers',
  conditions: 'conditions',
  materials: 'materials',
  movements: 'movements',
  reports: 'reports',
  products: 'products',
  orders: 'orders',
} as const
export type Tag = (typeof Tag)[keyof typeof Tag]
