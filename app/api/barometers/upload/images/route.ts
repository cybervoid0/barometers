import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { Storage } from '@google-cloud/storage'

const allowedExtensions = ['.jpeg', '.png', '.svg']

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: {
    client_email: process.env.GCP_CLIENT_EMAIL,
    private_key: process.env.GCP_PRIVATE_KEY,
  },
})
const bucket = storage.bucket(process.env.GCP_BUCKET_NAME)

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    // parallel files upload
    const uploadedImages: string[] = (
      await Promise.allSettled(
        Array.from(formData.values()).map(async file => {
          if (!(file instanceof File)) throw new Error('Not a file')
          const extension = path.extname(file.name).toLowerCase()
          if (!allowedExtensions.includes(extension)) throw new Error('Wrong file type')

          const fileName = `${uuidv4()}${extension}`
          const arrayBuffer = await file.arrayBuffer()
          const buffer = new Uint8Array(arrayBuffer)

          // save to google cloud
          const cloudFile = bucket.file(fileName)
          await cloudFile.save(buffer, {
            resumable: false,
            contentType: file.type,
            public: true,
          })

          return cloudFile.publicUrl()
        }),
      )
    )
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value)

    revalidatePath('/')

    return NextResponse.json({ images: uploadedImages }, { status: 201 })
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

    revalidatePath('/')

    return NextResponse.json({ message: `${fileName} was deleted` }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error deleting file' },
      { status: 500 },
    )
  }
}
