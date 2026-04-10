import { withPayload } from '@payloadcms/next/withPayload'

import redirects from './redirects.js'

const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined || process.env.__NEXT_PRIVATE_ORIGIN || 'http://localhost:3000'

const S3_ENDPOINT = process.env.S3_ENDPOINT
const STATIC_IMAGE_HOSTS = ['https://impgmtfund.com', 'https://www.impgmtfund.com']

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Default Next uses (cpu count - 1) static workers; each runs Payload + pg, which can exhaust
  // hosted Postgres connection limits and stall "Collecting page data". Override via NEXT_BUILD_CPUS.
  experimental: {
    cpus: Math.max(1, Number(process.env.NEXT_BUILD_CPUS) || 3),
    staticGenerationMaxConcurrency: Number(process.env.NEXT_STATIC_EXPORT_CONCURRENCY) || 2,
  },
  images: {
    qualities: [75, 85],
    remotePatterns: [
      ...[NEXT_PUBLIC_SERVER_URL, S3_ENDPOINT, ...STATIC_IMAGE_HOSTS]
        .filter(Boolean)
        .map((item) => {
          const url = new URL(item)

          return {
            hostname: url.hostname,
            protocol: url.protocol.replace(':', ''),
          }
        }),
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  reactStrictMode: true,
  redirects,
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
