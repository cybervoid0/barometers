declare namespace NodeJS {
  interface ProcessEnv {
    AUTH_SECRET: string
    GOOGLE_ID: string
    GOOGLE_CLIENT_SECRET: string
    MONGODB_URI: string
    NEXTAUTH_SECRET: string
    NEXTAUTH_URL: string
  }
}
