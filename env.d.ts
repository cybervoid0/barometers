import type { AccessRole } from '@prisma/client'

declare namespace NodeJS {
  interface ProcessEnv {
    AUTH_SECRET: string
    NEXTAUTH_SECRET: string
    NEXTAUTH_URL: string
    NEXT_PUBLIC_BASE_URL: string
    GCP_BUCKET_NAME: string
    GCP_CLIENT_EMAIL: string
    GCP_PRIVATE_KEY: string
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
