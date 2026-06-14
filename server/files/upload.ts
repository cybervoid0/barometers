// client-side upload transport (Uppy + presigned PUT to MinIO/S3)

import AwsS3, { type AwsBody } from '@uppy/aws-s3'
import Uppy from '@uppy/core'
import CompressorJS from 'compressorjs'
import { createTempFile } from './actions'
import { extractTempKey, type UploadMeta } from './upload-utils'

export type { UploadMeta }
export { uploadedFileToMediaFile } from './upload-utils'

export type UploadUppy = Uppy<UploadMeta, AwsBody>

// number of parallel uploads + retry backoff schedule (ms)
const UPLOAD_CONCURRENCY = 4
const RETRY_DELAYS = [0, 1000, 3000, 5000]
// only re-encode images above this size; smaller files are uploaded byte-for-byte
const COMPRESS_THRESHOLD_BYTES = 30 * 1024 * 1024
const LARGE_IMAGE_QUALITY = 0.92

function compressLargeImage(blob: Blob): Promise<Blob | File> {
  return new Promise((resolve, reject) => {
    new CompressorJS(blob, {
      quality: LARGE_IMAGE_QUALITY,
      // never auto-convert PNG → JPEG (compressorjs default is 5 MB threshold)
      convertSize: Number.POSITIVE_INFINITY,
      success: resolve,
      error: reject,
    })
  })
}

/**
 * Create a headless Uppy instance that uploads each file straight to object storage
 * via a per-file presigned PUT URL. Retries and per-file isolation are handled by
 * `@uppy/aws-s3`, so a single flaky file no longer fails the whole batch.
 *
 * Images ≤ 30 MB are uploaded unchanged. Larger images are lossily re-encoded at
 * quality 0.92 to stay under Cloudflare proxy limits; PDFs are never touched.
 */
export function createUploadUppy(): UploadUppy {
  const uppy: UploadUppy = new Uppy<UploadMeta, AwsBody>({ autoProceed: false })

  uppy.addPreProcessor(async fileIDs => {
    await Promise.all(
      fileIDs.map(async fileID => {
        const file = uppy.getFile(fileID)
        if (file.isRemote || file.data == null) return
        if (!file.type?.startsWith('image/')) return
        if (file.data.size <= COMPRESS_THRESHOLD_BYTES) return

        try {
          const compressedBlob = await compressLargeImage(file.data)
          const { type, size } = compressedBlob
          uppy.setFileState(fileID, {
            data: compressedBlob,
            ...(type && { type }),
            ...(size && { size }),
            meta: { ...file.meta, ...(type && { type }) },
          })
        } catch (error) {
          // fail open: upload the original if compression blows up
          console.warn('[upload] compression failed, uploading original:', error)
        }
      }),
    )
  })

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
