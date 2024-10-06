declare namespace NodeJS {
  interface ProcessEnv {
    AUTH_SECRET: string
    MONGODB_URI: string
    NEXTAUTH_SECRET: string
    NEXTAUTH_URL: string
    NEXT_PUBLIC_BASE_URL: string
    GCP_BUCKET_NAME: string
    GCP_CLIENT_EMAIL: string
    GCP_PRIVATE_KEY: string
  }
}
