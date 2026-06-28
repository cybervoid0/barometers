const root = {
  Home: '/',
  History: '/history/',
  Ephemera: '/ephemera/',
  Essays: '/essays/',
  About: '/about/',
  Brands: '/brands/',
  Terms: '/terms-and-conditions/',
  CookiePolicy: '/cookies/',
  PrivacyPolicy: '/privacy/',
  Signin: '/signin/',
  Register: '/register/',
} as const

const foundation = '/foundation'
const foundationRoutes = {
  Foundation: `${foundation}/`,
  Donate: `${foundation}/donate/`,
}

const categories = '/categories'
const collection = '/collection'
const collCat = collection + categories
const collectionRoutes = {
  Categories: `${collCat}/`,
  Barometer: `${collection}/items/`,
  NewArrivals: `${collection}/new-arrivals/`,
  Forecasters: `${collCat}/forecasters/`,
  "Friends'": `${collCat}/friends/`,
  Miscellaneous: `${collCat}/miscellaneous/`,
  Recorders: `${collCat}/recorders/`,
  Bourdon: `${collCat}/bourdon/`,
  Pocket: `${collCat}/pocket/`,
  Aneroid: `${collCat}/aneroid/`,
  Mercury: `${collCat}/mercury/`,
} as const

const admin = '/admin'
const adminRoutes = {
  Admin: `${admin}/`,
  AddBarometer: `${admin}/add-barometer/`,
  AddBrand: `${admin}/add-brand/`,
  AddDocument: `${admin}/add-document/`,
  AddProduct: `${admin}/add-product/`,
  AdminProducts: `${admin}/products/`,
  EditProduct: `${admin}/edit-product/`,
  AddEssay: `${admin}/add-essay/`,
  Reports: `${admin}/reports/`,
  AdminOrders: `${admin}/orders/`,
  Materials: `${admin}/materials/`,
  Movements: `${admin}/movements/`,
} as const

const shop = '/shop'
const shopRoutes = {
  Shop: `${shop}/`,
  Cart: `${shop}/cart`,
  Checkout: `${shop}/checkout`,
  Orders: `${shop}/orders/`,
  TrackOrder: `${shop}/orders/track`,
} as const

export const Route = {
  ...root,
  ...foundationRoutes,
  ...collectionRoutes,
  ...adminRoutes,
  ...shopRoutes,
} as const
export function isRouteKey(value: string): value is keyof typeof Route {
  return value in Route
}
