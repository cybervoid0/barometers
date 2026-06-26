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
    /** Set to "true" only after Stripe Tax is fully configured (active + origin address). */
    STRIPE_TAX_ENABLED?: string
    /** Resend API key. When absent, transactional emails are skipped (logged no-op). */
    RESEND_API_KEY?: string
    /** Verified sender, e.g. "Barometers Realm <noreply@barometers.info>". */
    EMAIL_FROM?: string
    /** Optional reply-to address (e.g. a monitored support inbox). */
    EMAIL_REPLY_TO?: string
    /**
     * Where new-order notifications are sent (admin inbox). Comma-separated for
     * multiple recipients. Defaults to orders@barometers.info.
     */
    ORDER_NOTIFICATIONS_EMAIL?: string
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
