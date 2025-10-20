import type { AccessRole } from '@prisma/client'

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production'
    AUTH_SECRET: string
    NEXTAUTH_SECRET: string
    NEXTAUTH_URL: string
    NEXT_PUBLIC_BASE_URL: string
    MINIO_ENDPOINT: string
    MINIO_ACCESS_KEY: string
    MINIO_SECRET_KEY: string
    NEXT_PUBLIC_MINIO_BUCKET: string
    NEXT_PUBLIC_MINIO_URL: string
    STRIPE_SECRET_KEY: string
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string
    STRIPE_WEBHOOK_SECRET: string
  }
}

declare module 'next-auth' {
  interface User {
    role?: AccessRole
  }
  interface Session {
    user: User
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: AccessRole
  }
}
