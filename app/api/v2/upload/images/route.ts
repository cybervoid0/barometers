import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { v4 as uuid } from 'uuid'
import { GetSignedUrlConfig } from '@google-cloud/storage'
import { FileDto, UrlDto, UrlProps } from './types'
import bucket from '@/utils/googleStorage'

export async function POST(req: NextRequest) {
  try {
    const { files }: FileDto = await req.json()
    const signedUrls = await Promise.all(
      files.map<Promise<UrlProps>>(async ({ fileName, contentType }) => {
        // give unique names to files
        const extension = path.extname(fileName).toLowerCase()
        const newFileName = `gallery/${uuid()}${extension}`
        const options: GetSignedUrlConfig = {
          version: 'v4',
          action: 'write',
          expires: Date.now() + 15 * 60 * 1000, // 15 min
          contentType,
        }
        const cloudFile = bucket.file(newFileName)
        // generate signed URL for each file
        const [signedUrl] = await cloudFile.getSignedUrl(options)
        return {
          signed: signedUrl,
          public: cloudFile.name,
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
  try {
    const { searchParams } = new URL(req.url)
    const fileName = searchParams.get('fileName')
    if (!fileName) return NextResponse.json({ message: 'File name is required' }, { status: 400 })

    // delete file from google cloud storage
    const file = bucket.file(fileName)
    await file.delete()

    return NextResponse.json({ message: `${fileName} was deleted` }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error deleting file' },
      { status: 500 },
    )
  }
}
