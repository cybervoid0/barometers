export type { BarometerListDTO, ParameterizedBarometerListDTO } from './api/v2/barometers/route'
export type { CategoryListDTO } from './api/v2/categories/route'
export type { CategoryDTO } from './api/v2/categories/[name]/route'
export type { BarometerDTO } from './api/v2/barometers/[slug]/route'
export type { ConditionListDTO } from './api/v2/conditions/route'
export type { ManufacturerListDTO } from './api/v2/manufacturers/route'
export type { ManufacturerDTO } from './api/v2/manufacturers/[id]/route'
export type { SearchResultsDTO } from './api/v2/search/route'
/**
 * Barometer dimensions database JSON structure
 */
export type Dimensions = Record<string, string>[]
