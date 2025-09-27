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
  AddBrand: '/admin/add-brand/',
  AddDocument: '/admin/add-document/',
  Reports: '/admin/reports/',
  CookiePolicy: '/cookies/',
  PrivacyPolicy: '/privacy/',
  Documents: '/documents/',
} as const

export type FrontRoutes = (typeof FrontRoutes)[keyof typeof FrontRoutes]
