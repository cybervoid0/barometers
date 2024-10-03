import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import path from 'path'
import fs from 'fs-extra'
import { v4 as uuidv4 } from 'uuid'

const uploadDirPath = path.join(process.cwd(), 'public', 'uploads', 'images')
const allowedExtensions = ['.jpeg', '.png', '.svg']

export async function POST(req: NextRequest) {
  try {
    await fs.ensureDir(uploadDirPath)
    const formData = await req.formData()
    const uploadedImages = []

    for (const file of formData.values()) {
      if (file instanceof File) {
        const extension = path.extname(file.name).toLowerCase()

        if (!allowedExtensions.includes(extension)) {
          return NextResponse.json(
            { message: `Unsupported file format for ${file.name}` },
            { status: 406 },
          )
        }

        const fileName = `${uuidv4()}${extension}`
        const filePath = path.join(uploadDirPath, fileName)

        const arrayBuffer = await file.arrayBuffer()
        const buffer = new Uint8Array(arrayBuffer)

        await fs.writeFile(filePath, buffer)

        uploadedImages.push(`/uploads/images/${fileName}`)
      }
    }

    revalidatePath('/')

    return NextResponse.json({ images: uploadedImages }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error uploading file' },
      { status: 500 },
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const fileName = searchParams.get('fileName')
    if (!fileName) return NextResponse.json({ message: 'File name is required' }, { status: 400 })

    const filePath = path.join(uploadDirPath, fileName)
    if (!(await fs.pathExists(filePath))) {
      return NextResponse.json({ message: 'File not found' }, { status: 404 })
    }

    await fs.remove(filePath)
    revalidatePath('/')

    return NextResponse.json({ message: `${fileName} was deleted` }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error deleting file' },
      { status: 500 },
    )
  }
}
