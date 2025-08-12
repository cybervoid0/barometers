export const FrontRoutes = {
  Home: '/',
  History: '/history/',
  About: '/about/',
  Brands: '/brands/',
  Terms: '/terms-and-conditions/',
  Categories: '/collection/categories/',
  Barometer: '/collection/items/',
  NewArrivals: '/collection/new-arrivals/',
  Admin: '/admin/',
  AddBarometer: '/admin/add-barometer/',
  Reports: '/admin/reports/',
} as const

export type FrontRoutes = (typeof FrontRoutes)[keyof typeof FrontRoutes]
