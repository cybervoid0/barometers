const base = `${process.env.NEXT_PUBLIC_BASE_URL}/api/v2/`

export const ApiRoutes = {
  Barometers: `${base}barometers/`,
  Categories: `${base}categories/`,
  Manufacturers: `${base}manufacturers/`,
  Conditions: `${base}conditions/`,
  ImageUpload: `${base}upload/images/`,
  BarometerSearch: `${base}search/`,
  Reports: `${base}report/`,
  Subcategories: `${base}subcategories/`,
  Materials: `${base}materials/`,
} as const
export type ApiRoutes = (typeof ApiRoutes)[keyof typeof ApiRoutes]
