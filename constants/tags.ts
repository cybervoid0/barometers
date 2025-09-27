export const Tag = {
  brands: 'brands',
  documents: 'documents',
} as const
export type Tag = (typeof Tag)[keyof typeof Tag]
