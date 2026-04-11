import canUseDOM from '@/utilities/canUseDOM'

const DEFAULT_PRODUCTION_URL = 'https://www.impgmtfund.com'

const withProtocol = (value: string) => {
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  return `https://${value}`
}

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')

/**
 * Extra origins Payload accepts for CSRF checks on cookie-based JWT (see `extractJWT` in payload).
 * Without this, opening the admin on a host that differs from `serverURL` (e.g. LAN IP while
 * serverURL is localhost) strips auth and server actions like `render-document` return 401.
 *
 * Set `PAYLOAD_CSRF_EXTRA_ORIGINS` to a comma-separated list, e.g.
 * `http://192.168.88.54:3000,http://10.0.0.5:3000`
 */
export function getPayloadCsrfExtraOrigins(): string[] {
  const extras = new Set<string>()

  for (const raw of process.env.PAYLOAD_CSRF_EXTRA_ORIGINS?.split(',') ?? []) {
    const o = raw.trim()
    if (o) extras.add(o)
  }

  const nextPrivate = process.env.__NEXT_PRIVATE_ORIGIN?.trim()
  if (nextPrivate) {
    try {
      extras.add(new URL(nextPrivate).origin)
    } catch {
      // ignore invalid URL
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    extras.add('http://127.0.0.1:3000')
  }

  return [...extras]
}

export const getServerSideURL = () => {
  // Preview must win over NEXT_PUBLIC_SERVER_URL (often set to the production domain for all envs on Vercel).
  if (process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_URL) {
    return trimTrailingSlash(withProtocol(process.env.VERCEL_URL))
  }

  const explicit = process.env.NEXT_PUBLIC_SERVER_URL?.trim()
  if (explicit) return trimTrailingSlash(withProtocol(explicit))

  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (vercelProduction) return trimTrailingSlash(withProtocol(vercelProduction))

  if (process.env.NODE_ENV === 'production') return DEFAULT_PRODUCTION_URL

  return 'http://localhost:3000'
}

/**
 * Origins allowed for Payload CORS (REST/GraphQL responses). Must cover any host you use to open
 * the admin in the browser — same list as CSRF extras plus `serverURL` — or credentialed `fetch`
 * from the API tab / admin will fail with "Failed to fetch" when e.g. `serverURL` is localhost
 * but you browse via a LAN IP.
 */
export function getPayloadCorsOrigins(): string[] {
  const origins = new Set<string>()
  const server = getServerSideURL()
  if (server) origins.add(server)
  for (const o of getPayloadCsrfExtraOrigins()) {
    if (o) origins.add(o)
  }
  return [...origins]
}

export const getClientSideURL = () => {
  if (canUseDOM) {
    const protocol = window.location.protocol
    const domain = window.location.hostname
    const port = window.location.port

    return `${protocol}//${domain}${port ? `:${port}` : ''}`
  }

  if (process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_URL) {
    return trimTrailingSlash(withProtocol(process.env.VERCEL_URL))
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return trimTrailingSlash(withProtocol(process.env.VERCEL_PROJECT_PRODUCTION_URL))
  }

  return process.env.NEXT_PUBLIC_SERVER_URL
    ? trimTrailingSlash(withProtocol(process.env.NEXT_PUBLIC_SERVER_URL))
    : ''
}
