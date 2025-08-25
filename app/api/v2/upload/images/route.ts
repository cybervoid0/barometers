import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { v4 as uuid } from 'uuid'
import { minioBucket, minioClient } from '@/services/minio'
import { FileDto, UrlDto, UrlProps } from './types'

export async function POST(req: NextRequest) {
  try {
    const { files }: FileDto = await req.json()
    const signedUrls = await Promise.all(
      files.map<Promise<UrlProps>>(async ({ fileName }) => {
        // give unique names to files
        const extension = path.extname(fileName).toLowerCase()
        const newFileName = `gallery/${uuid()}${extension}`
        const signedUrl = await minioClient.presignedPutObject(minioBucket, newFileName)
        return {
          signed: signedUrl,
          public: newFileName,
        }
      }),
    )
    return NextResponse.json<UrlDto>(
      {
        urls: signedUrls,
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error uploading files' },
      { status: 500 },
    )
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const fileName = searchParams.get('fileName')
  try {
    if (!fileName) return NextResponse.json({ message: 'File name is required' }, { status: 400 })
    // delete file from Minio storage
    await minioClient.removeObject(minioBucket, fileName)
    return NextResponse.json({ message: `${fileName} was deleted` }, { status: 200 })
  } catch (_error) {
    return NextResponse.json(
      { message: `${fileName ?? 'Your file'} is already deleted` },
      { status: 200 },
    )
  }
}
