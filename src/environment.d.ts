declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PAYLOAD_SECRET: string
      DATABASE_URL: string
      NEXT_PUBLIC_SERVER_URL: string
      /** Dev/local origin for Payload admin API when NEXT_PUBLIC_SERVER_URL is production. */
      PAYLOAD_PUBLIC_SERVER_URL?: string
      /** Comma-separated origins for Payload CORS/CSRF (e.g. LAN admin URL). */
      PAYLOAD_CSRF_EXTRA_ORIGINS?: string
      VERCEL_PROJECT_PRODUCTION_URL: string
      S3_ENDPOINT: string
      S3_ACCESS_KEY_ID: string
      S3_SECRET_ACCESS_KEY: string
      S3_BUCKET: string
      S3_REGION: string
      WIX_API_KEY: string
      WIX_SITE_ID: string
      WIX_ACCOUNT_ID: string
      RESEND_API_KEY: string
      RESEND_FROM_EMAIL: string
      RESEND_FROM_NAME: string
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
