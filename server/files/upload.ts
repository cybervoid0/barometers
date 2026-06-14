// client-side upload transport (Uppy + presigned PUT to MinIO/S3)

import AwsS3, { type AwsBody } from '@uppy/aws-s3'
import Compressor from '@uppy/compressor'
import Uppy, { type UppyFile } from '@uppy/core'
import type { MediaFile } from '@/types'
import { createTempFile } from './actions'

// storage object key (e.g. "temp/uuid.jpg"), set once the presigned URL is issued.
// Must be a type alias (not interface) so it satisfies Uppy's `Meta` index-signature constraint.
export type UploadMeta = {
  tempKey?: string
}

export type UploadUppy = Uppy<UploadMeta, AwsBody>

// number of parallel uploads + retry backoff schedule (ms)
const UPLOAD_CONCURRENCY = 4
const RETRY_DELAYS = [0, 1000, 3000, 5000]
// compressorjs quality for images; non-image files are skipped by the plugin
const IMAGE_COMPRESSION_QUALITY = 0.8

/** Derive the storage object key (e.g. "temp/uuid.jpg") from a presigned URL. */
function extractTempKey(presignedUrl: string): string {
  return new URL(presignedUrl).pathname.split('/').slice(-2).join('/')
}

function stripExtension(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, '') || fileName
}

/**
 * Create a headless Uppy instance that compresses images, then uploads each file
 * straight to object storage via a per-file presigned PUT URL. Retries and
 * per-file isolation are handled by `@uppy/aws-s3`, so a single flaky file no
 * longer fails the whole batch. Works for both images and PDFs (compression is a
 * no-op on non-image files).
 */
export function createUploadUppy(): UploadUppy {
  const uppy: UploadUppy = new Uppy<UploadMeta, AwsBody>({ autoProceed: false })

  uppy.use(Compressor, { quality: IMAGE_COMPRESSION_QUALITY })

  uppy.use(AwsS3, {
    shouldUseMultipart: false,
    limit: UPLOAD_CONCURRENCY,
    retryDelays: RETRY_DELAYS,
    getUploadParameters: async file => {
      const fileName = file.name ?? crypto.randomUUID()
      const presignedUrl = await createTempFile(fileName)
      uppy.setFileMeta(file.id, { tempKey: extractTempKey(presignedUrl) })
      return {
        method: 'PUT' as const,
        url: presignedUrl,
        fields: {},
        headers: { 'Content-Type': file.type ?? 'application/octet-stream' },
      }
    },
  })

  return uppy
}

/** Map a successfully uploaded Uppy file to the app's `MediaFile` shape. */
export function uploadedFileToMediaFile(file: UppyFile<UploadMeta, AwsBody>): MediaFile | null {
  const url = file.meta.tempKey
  if (!url) return null
  return { url, name: stripExtension(file.name ?? url) }
}
