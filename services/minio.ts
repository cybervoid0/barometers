import { Client as Minio } from 'minio'

export const minioClient = new Minio({
  endPoint: process.env.MINIO_ENDPOINT ?? '',
  port: Number(process.env.MINIO_PORT),
  useSSL: process.env.NODE_ENV === 'production',
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
})

export const minioBucket = process.env.NEXT_PUBLIC_MINIO_BUCKET ?? ''
