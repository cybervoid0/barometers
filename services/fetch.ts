import type { InaccuracyReport } from '@prisma/client'
import { ApiRoutes } from '@/constants/routes-back'
import type { FileProps, InaccuracyReportListDTO, UrlDto } from '@/types'

/**
 * Handles API response errors by extracting a detailed error message from the response body.
 * Falls back to the default statusText if no message is provided or parsing fails.
 * @param res - The Response object from the fetch call.
 * @throws {Error} Throws an error with the extracted or default error message.
 */
export async function handleApiError(res: Response): Promise<void> {
  try {
    const errorData = await res.json()
    const errorMessage = errorData.message || res.statusText
    throw new Error(errorMessage)
  } catch (_error) {
    throw new Error(res.statusText ?? res.text ?? 'handleApiError: unknown error')
  }
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
