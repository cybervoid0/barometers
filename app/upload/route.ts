import { NextRequest, NextResponse } from 'next/server'
import multer from 'multer'
import path from 'path'
import fs from 'fs-extra'

// Настраиваем multer для сохранения файлов в папку /public/uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      const uploadFolder = path.join(process.cwd(), '/public/uploads')
      await fs.ensureDir(uploadFolder) // Создаём папку, если её нет
      cb(null, uploadFolder)
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
      cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`)
    },
  }),
})

// Миддлварь для обработки загрузки файла через multer
const uploadMiddleware = upload.single('file')

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, result => {
      if (result instanceof Error) {
        return reject(result)
      }
      return resolve(result)
    })
  })
}

export async function POST(req: NextRequest) {
  const res = new NextResponse()

  try {
    const reqExpress = { ...req, body: {}, headers: req.headers }
    await runMiddleware(reqExpress, res, uploadMiddleware) // Используем multer для обработки файла

    const filePath = `/uploads/${reqExpress.file.filename}`

    return NextResponse.json({ status: 'success', filePath }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ status: 'fail', message: error.message }, { status: 500 })
  }
}

export const config = {
  api: {
    bodyParser: false, // Отключаем bodyParser, чтобы multer мог обрабатывать form-data
  },
}
