/**
 * @jest-environment node
 */
import type { AwsBody } from '@uppy/aws-s3'
import type { UppyFile } from '@uppy/core'
import {
  extractTempKey,
  stripExtension,
  type UploadMeta,
  uploadedFileToMediaFile,
} from '@/utils/upload-helpers'

// Build a minimal UppyFile-shaped object for the bits the helper actually reads.
function fakeUppyFile(meta: UploadMeta, name?: string) {
  return { meta, name } as unknown as UppyFile<UploadMeta, AwsBody>
}

describe('extractTempKey', () => {
  it('drops the presigned query string and returns the temp/<name> key', () => {
    const url =
      'https://s3.barometers.info/test-bucket/temp/abc-123.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Signature=deadbeef'
    expect(extractTempKey(url)).toBe('temp/abc-123.jpg')
  })

  it('handles path-style URLs (bucket in path)', () => {
    expect(extractTempKey('https://host/bucket/temp/uuid.png?sig=1')).toBe('temp/uuid.png')
  })

  it('handles keys without an extension', () => {
    expect(extractTempKey('https://host/bucket/temp/uuid?sig=1')).toBe('temp/uuid')
  })
})

describe('stripExtension', () => {
  it('removes a single trailing extension', () => {
    expect(stripExtension('photo.jpg')).toBe('photo')
  })

  it('removes only the last extension', () => {
    expect(stripExtension('archive.tar.gz')).toBe('archive.tar')
  })

  it('leaves names without an extension untouched', () => {
    expect(stripExtension('noext')).toBe('noext')
  })

  it('keeps dotfiles intact (no name left after stripping)', () => {
    expect(stripExtension('.gitignore')).toBe('.gitignore')
  })
})

describe('uploadedFileToMediaFile', () => {
  it('maps tempKey + name into a MediaFile (name without extension)', () => {
    const file = fakeUppyFile({ tempKey: 'temp/uuid.jpg' }, 'My Photo.jpg')
    expect(uploadedFileToMediaFile(file)).toEqual({ url: 'temp/uuid.jpg', name: 'My Photo' })
  })

  it('returns null when tempKey is missing (upload did not register a key)', () => {
    const file = fakeUppyFile({}, 'orphan.jpg')
    expect(uploadedFileToMediaFile(file)).toBeNull()
  })

  it('falls back to the key when the file has no name', () => {
    const file = fakeUppyFile({ tempKey: 'temp/uuid.jpg' }, undefined)
    expect(uploadedFileToMediaFile(file)).toEqual({ url: 'temp/uuid.jpg', name: 'temp/uuid' })
  })
})
