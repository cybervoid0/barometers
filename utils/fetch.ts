import { Manufacturer } from '@prisma/client'
import { SortValue } from '@/app/collection/categories/[category]/types'
import {
  barometersApiRoute,
  barometersSearchRoute,
  categoriesApiRoute,
  conditionsApiRoute,
  manufacturersApiRoute,
} from '@/app/constants'
import type {
  BarometerListDTO,
  CategoryDTO,
  CategoryListDTO,
  BarometerDTO,
  ParameterizedBarometerListDTO,
  ConditionListDTO,
  ManufacturerListDTO,
  ManufacturerDTO,
  SearchResultsDTO,
} from '@/app/types'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

/******* Barometers ********/
export async function fetchBarometer(slug: string): Promise<BarometerDTO> {
  const res = await fetch(baseUrl + barometersApiRoute + slug)
  return res.json()
}
export async function fetchAllBarometers(): Promise<BarometerListDTO> {
  const res = await fetch(baseUrl + barometersApiRoute)
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
  size?: number | string
  page?: number | string
}): Promise<ParameterizedBarometerListDTO> {
  const url = baseUrl + barometersApiRoute
  const qsParams = new URLSearchParams({ category, sort, size: String(size), page: String(page) })
  const res = await fetch(`${url}?${qsParams}`)
  return res.json()
}
export async function searchBarometers(
  searchParams: Record<string, string>,
): Promise<SearchResultsDTO> {
  const pageSize = '6'
  const url = `${baseUrl + barometersSearchRoute}?${new URLSearchParams({ ...searchParams, size: pageSize })}`
  const res = await fetch(url, { cache: 'no-cache' })
  return res.json()
}
/******* Categories ********/
export async function fetchCategoryList(): Promise<CategoryListDTO> {
  const res = await fetch(baseUrl + categoriesApiRoute)
  return res.json()
}
export async function fetchCategory(name: string): Promise<CategoryDTO> {
  const res = await fetch(baseUrl + categoriesApiRoute + name)
  return res.json()
}

/******* Conditions ********/
export async function fetchConditions(): Promise<ConditionListDTO> {
  const res = await fetch(baseUrl + conditionsApiRoute)
  return res.json()
}

/******* Manufacturers ********/
export async function fetchManufacturerList(): Promise<ManufacturerListDTO> {
  const res = await fetch(baseUrl + manufacturersApiRoute)
  return res.json()
}
export async function fetchManufacturer(id: string): Promise<ManufacturerDTO> {
  const res = await fetch(baseUrl + manufacturersApiRoute + id)
  return res.json()
}
export async function deleteManufacturer(id: string) {
  await fetch(baseUrl + manufacturersApiRoute + id, {
    method: 'DELETE',
  })
}
export async function addManufacturer(
  manufacturer: Partial<Manufacturer>,
): Promise<{ id: string }> {
  const res = await fetch(baseUrl + manufacturersApiRoute, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(manufacturer),
  })
  return res.json()
}
