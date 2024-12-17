import { SortValue } from '@/app/collection/types/[type]/types'
import { barometersApiRoute, categoriesApiRoute } from '@/app/constants'
import type {
  BarometerListDTO,
  CategoryDTO,
  CategoryListDTO,
  BarometerDTO,
  ParameterizedBarometerListDTO,
} from '@/app/types'

/******* Barometers ********/
export async function fetchBarometer(slug: string): Promise<BarometerDTO> {
  const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + barometersApiRoute + slug)
  return res.json()
}
export async function fetchAllBarometers(): Promise<BarometerListDTO> {
  const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + barometersApiRoute)
  return res.json()
}
export async function fetchBarometersByCategory({
  category,
  sort = 'date',
  size = 6,
  page = 1,
}: {
  category: string
  sort?: SortValue
  size?: number
  page?: number
}): Promise<ParameterizedBarometerListDTO> {
  const url = process.env.NEXT_PUBLIC_BASE_URL + barometersApiRoute
  const qsParams = new URLSearchParams({ category, sort, size: String(size), page: String(page) })
  const res = await fetch(`${url}?${qsParams}`)
  return res.json()
}
/******* Categories ********/
export async function fetchCategoryList(): Promise<CategoryListDTO> {
  const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + categoriesApiRoute)
  return res.json()
}
export async function fetchCategory(name: string): Promise<CategoryDTO> {
  const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + categoriesApiRoute + name)
  return res.json()
}
