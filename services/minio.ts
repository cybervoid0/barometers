import { Client as Minio } from 'minio'

export const minioClient = new Minio({
  endPoint: process.env.MINIO_ENDPOINT ?? '',
  useSSL: true,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
})

export const minioBucket = process.env.NEXT_PUBLIC_MINIO_BUCKET ?? ''
