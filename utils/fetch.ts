import { InaccuracyReport, Manufacturer } from '@prisma/client'
import { ApiRoutes } from '@/utils/routes-back'
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
  SubcategoryListDTO,
  MaterialListDTO,
  CountryListDTO,
  UrlDto,
  FileProps,
} from '@/app/types'
import { handleApiError } from './misc'

/******* Barometers ********/
export async function fetchBarometer(slug: string): Promise<BarometerDTO> {
  const res = await fetch(ApiRoutes.Barometers + slug)
  return res.json()
}
export async function fetchBarometerList(
  searchParams: Record<string, string>,
): Promise<BarometerListDTO> {
  const res = await fetch(`${ApiRoutes.Barometers}?${new URLSearchParams(searchParams)}`, {
    cache: 'no-cache',
  })
  return res.json()
}
export async function searchBarometers(
  searchParams: Record<string, string>,
): Promise<SearchResultsDTO> {
  const pageSize = '10'
  const url = `${ApiRoutes.BarometerSearch}?${new URLSearchParams({ ...searchParams, size: pageSize })}`
  const res = await fetch(url, { cache: 'no-cache' })
  return res.json()
}
export async function createBarometer<T>(barometer: T): Promise<{ id: string }> {
  const res = await fetch(ApiRoutes.Barometers, {
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
  const res = await fetch(ApiRoutes.Barometers, {
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
  const res = await fetch(`${ApiRoutes.Barometers}/${slug}`, {
    method: 'DELETE',
  })
  if (!res.ok) await handleApiError(res)
  return res.json()
}
/******* Categories ********/
export async function fetchCategoryList(): Promise<CategoryListDTO> {
  const res = await fetch(ApiRoutes.Categories)
  return res.json()
}
export async function fetchCategory(name: string): Promise<CategoryDTO> {
  const res = await fetch(ApiRoutes.Categories + name)
  return res.json()
}

/******* Conditions ********/
export async function fetchConditions(): Promise<ConditionListDTO> {
  const res = await fetch(ApiRoutes.Conditions)
  return res.json()
}

/******* Manufacturers ********/
export async function fetchManufacturerList(searchParams?: {
  page?: string
  size?: string
}): Promise<ManufacturerListDTO> {
  const res = await fetch(
    `${ApiRoutes.Manufacturers}${searchParams ? `?${new URLSearchParams(searchParams)}` : ''}`,
    {
      cache: 'no-cache',
    },
  )
  return res.json()
}
export async function fetchManufacturer(slug: string): Promise<ManufacturerDTO> {
  const res = await fetch(ApiRoutes.Manufacturers + slug)
  return res.json()
}
export async function deleteManufacturer(slug: string) {
  await fetch(ApiRoutes.Manufacturers + slug, {
    method: 'DELETE',
  })
}
export async function addManufacturer(
  manufacturer: { countries: { id: number }[] } & Partial<Manufacturer>,
): Promise<{ id: string }> {
  const res = await fetch(ApiRoutes.Manufacturers, {
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
  updatedData: Partial<Manufacturer>,
): Promise<Manufacturer> {
  const res = await fetch(ApiRoutes.Manufacturers, {
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
  const res = await fetch(ApiRoutes.ImageUpload, {
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
  const url = `${ApiRoutes.ImageUpload}?${new URLSearchParams({ fileName })}`
  const res = await fetch(url, {
    method: 'DELETE',
  })
  if (!res.ok) await handleApiError(res)
}
/******* Inaccuracy Report ********/
export async function createReport(report: Partial<InaccuracyReport>): Promise<{ id: string }> {
  const res = await fetch(ApiRoutes.Reports, {
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
  const qs = new URLSearchParams(searchParams)
  const res = await fetch(`${ApiRoutes.Reports}?${qs.toString()}`, {
    cache: 'no-cache',
  })
  return res.json()
}
/******* Subcategories (Movement types) ********/
export async function fetchSubcategoryList(): Promise<SubcategoryListDTO> {
  const res = await fetch(ApiRoutes.Subcategories)
  return res.json()
}
/******* Materials ********/
export async function fetchMaterialList(): Promise<MaterialListDTO> {
  const res = await fetch(ApiRoutes.Materials)
  return res.json()
}
/******* Countries ********/
export async function fetchCountryList(): Promise<CountryListDTO> {
  const res = await fetch(ApiRoutes.Countries)
  return res.json()
}
