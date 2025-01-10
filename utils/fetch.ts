import { InaccuracyReport, Manufacturer } from '@prisma/client'
import {
  barometersApiRoute,
  barometersSearchRoute,
  categoriesApiRoute,
  conditionsApiRoute,
  manufacturersApiRoute,
  imageUploadApiRoute,
  reportRoute,
} from '@/app/constants'
import type {
  CategoryDTO,
  CategoryListDTO,
  BarometerDTO,
  BarometerListDTO,
  ConditionListDTO,
  ManufacturerListDTO,
  ManufacturerDTO,
  SearchResultsDTO,
  InaccuracyReportListDTO,
} from '@/app/types'
import { handleApiError } from './misc'
import { UrlDto, FileProps } from '@/app/api/v2/upload/images/types'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

/******* Barometers ********/
export async function fetchBarometer(slug: string): Promise<BarometerDTO> {
  const res = await fetch(baseUrl + barometersApiRoute + slug)
  return res.json()
}
export async function fetchBarometerList(
  searchParams: Record<string, string>,
): Promise<BarometerListDTO> {
  const url = baseUrl + barometersApiRoute
  const res = await fetch(`${url}?${new URLSearchParams(searchParams)}`, {
    cache: 'no-cache',
  })
  return res.json()
}
export async function searchBarometers(
  searchParams: Record<string, string>,
): Promise<SearchResultsDTO> {
  const pageSize = '10'
  const url = `${baseUrl + barometersSearchRoute}?${new URLSearchParams({ ...searchParams, size: pageSize })}`
  const res = await fetch(url, { cache: 'no-cache' })
  return res.json()
}
export async function createBarometer<T>(barometer: T): Promise<{ id: string }> {
  const res = await fetch(baseUrl + barometersApiRoute, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(barometer),
  })
  if (!res.ok) await handleApiError(res)
  return res.json()
}
export async function updateBarometer<T>(barometer: T): Promise<{ slug: string }> {
  const res = await fetch(barometersApiRoute, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(barometer),
  })
  if (!res.ok) await handleApiError(res)
  return res.json()
}
export async function deleteBarometer(slug: string): Promise<{ message: string }> {
  const res = await fetch(`${barometersApiRoute}/${slug}`, {
    method: 'DELETE',
  })
  if (!res.ok) await handleApiError(res)
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
export async function fetchManufacturerList(searchParams?: {
  page?: string
  size?: string
}): Promise<ManufacturerListDTO> {
  const url = baseUrl + manufacturersApiRoute
  const res = await fetch(`${url}${searchParams ? `?${new URLSearchParams(searchParams)}` : ''}`, {
    cache: 'no-cache',
  })
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
  if (!res.ok) await handleApiError(res)
  return res.json()
}
export async function updateManufacturer(
  id: string,
  updatedData: Partial<Manufacturer>,
): Promise<Manufacturer> {
  const res = await fetch(`${baseUrl + manufacturersApiRoute}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedData),
  })
  if (!res.ok) await handleApiError(res)
  return res.json()
}
/******* Images ********/
export async function createImageUrls(files: FileProps[]): Promise<UrlDto> {
  const res = await fetch(imageUploadApiRoute, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ files }),
  })
  if (!res.ok) await handleApiError(res)
  return res.json()
}
export async function uploadFileToCloud(url: string, file: File) {
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  })
  if (!res.ok) await handleApiError(res)
}
export async function deleteImage(fileName: string) {
  const url = `${imageUploadApiRoute}?${new URLSearchParams({ fileName })}`
  const res = await fetch(url, {
    method: 'DELETE',
  })
  if (!res.ok) await handleApiError(res)
}
/******* Inaccuracy Report ********/
export async function createReport(report: Partial<InaccuracyReport>): Promise<{ id: string }> {
  const res = await fetch(baseUrl + reportRoute, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(report),
  })
  if (!res.ok) await handleApiError(res)
  return res.json()
}
export async function fetchReportList(
  searchParams: Record<string, string>,
): Promise<InaccuracyReportListDTO> {
  const url = baseUrl + reportRoute
  const qs = new URLSearchParams(searchParams)
  const res = await fetch(`${url}?${qs.toString()}`, {
    cache: 'no-cache',
  })
  return res.json()
}
