export const FrontRoutes = {
  Home: '/',
  History: '/history/',
  Foundation: '/foundation/',
  Donate: '/foundation/donate/',
  About: '/about/',
  Brands: '/brands/',
  Terms: '/terms-and-conditions/',
  Categories: '/collection/categories/',
  Barometer: '/collection/items/',
  NewArrivals: '/collection/new-arrivals/',
  Admin: '/admin/',
  AddBarometer: '/admin/add-barometer/',
  AddDocument: '/admin/add-document/',
  Reports: '/admin/reports/',
  CookiePolicy: '/cookies/',
} as const

export type FrontRoutes = (typeof FrontRoutes)[keyof typeof FrontRoutes]
