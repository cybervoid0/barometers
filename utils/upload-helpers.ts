// Pure, dependency-free helpers for the upload transport. Kept separate from
// upload.ts so they can be unit-tested without pulling in Uppy / compressorjs
// (which require browser globals at import time).

import type { AwsBody } from '@uppy/aws-s3'
import type { UppyFile } from '@uppy/core'
import type { MediaFile } from '@/types'

// storage object key (e.g. "temp/uuid.jpg"), set once the presigned URL is issued.
// Must be a type alias (not interface) so it satisfies Uppy's `Meta` index-signature constraint.
export type UploadMeta = {
  tempKey?: string
}

/**
 * Derive the storage object key (e.g. "temp/uuid.jpg") from a presigned URL.
 * Presigned URLs always carry a query string (`?X-Amz-...`); `URL.pathname`
 * drops it, and the last two path segments are the `temp/<name>` key.
 */
export function extractTempKey(presignedUrl: string): string {
  return new URL(presignedUrl).pathname.split('/').slice(-2).join('/')
}

/** Strip a single trailing extension; keep the original for dotfiles / no-ext names. */
export function stripExtension(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, '') || fileName
}

/** Map a successfully uploaded Uppy file to the app's `MediaFile` shape. */
export function uploadedFileToMediaFile(file: UppyFile<UploadMeta, AwsBody>): MediaFile | null {
  const url = file.meta.tempKey
  if (!url) return null
  return { url, name: stripExtension(file.name ?? url) }
}
