import canUseDOM from '@/utilities/canUseDOM'

const DEFAULT_PRODUCTION_URL = 'https://www.impgmtfund.com'

const withProtocol = (value: string) => {
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  return `https://${value}`
}

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')

export const getServerSideURL = () => {
  const configuredURL = process.env.NEXT_PUBLIC_SERVER_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL

  if (configuredURL) return trimTrailingSlash(withProtocol(configuredURL))
  if (process.env.NODE_ENV === 'production') return DEFAULT_PRODUCTION_URL

  return 'http://localhost:3000'
}

export const getClientSideURL = () => {
  if (canUseDOM) {
    const protocol = window.location.protocol
    const domain = window.location.hostname
    const port = window.location.port

    return `${protocol}//${domain}${port ? `:${port}` : ''}`
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return withProtocol(process.env.VERCEL_PROJECT_PRODUCTION_URL)

  return process.env.NEXT_PUBLIC_SERVER_URL
    ? trimTrailingSlash(withProtocol(process.env.NEXT_PUBLIC_SERVER_URL))
    : ''
}
