export type { BarometerListDTO, ParameterizedBarometerListDTO } from './api/v2/barometers/route'
export type { CategoryListDTO } from './api/v2/categories/route'
export type { CategoryDTO } from './api/v2/categories/[name]/route'
export type { BarometerDTO } from './api/v2/barometers/[slug]/route'
/**
 * Barometer dimensions database JSON structure
 */
export type Dimensions = Record<string, string>[]
