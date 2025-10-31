export const Tag = {
  brands: 'brands',
  documents: 'documents',
  products: 'products',
  orders: 'orders',
} as const
export type Tag = (typeof Tag)[keyof typeof Tag]
