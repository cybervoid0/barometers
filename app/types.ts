export type { BarometerListDTO, ParameterizedBarometerListDTO } from './api/v2/barometers/getters'
export type { CategoryListDTO } from './api/v2/categories/getters'
export type { CategoryDTO } from './api/v2/categories/[name]/getters'
export type { BarometerDTO } from './api/v2/barometers/[slug]/getters'
export type { ConditionListDTO } from './api/v2/conditions/getters'
export type { ManufacturerListDTO } from './api/v2/manufacturers/getters'
export type { ManufacturerDTO } from './api/v2/manufacturers/[id]/getters'
export type { SearchResultsDTO } from './api/v2/search/search'
/**
 * Barometer dimensions database JSON structure
 */
export type Dimensions = { dim: string; value: string }[]
