import { getClientSideURL, getPayloadCsrfExtraOrigins, getServerSideURL } from '../getURL'

const snapshot = { ...process.env }

function restoreEnv() {
  process.env = { ...snapshot } as NodeJS.ProcessEnv
}

function setEnv(updates: Record<string, string | undefined>) {
  restoreEnv()
  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined) Reflect.deleteProperty(process.env, key)
    else process.env[key] = value
  }
}

afterEach(() => {
  restoreEnv()
})

describe('getServerSideURL', () => {
  beforeEach(() => {
    setEnv({
      NODE_ENV: 'development',
      VERCEL_ENV: undefined,
      VERCEL_URL: undefined,
      VERCEL_PROJECT_PRODUCTION_URL: undefined,
      NEXT_PUBLIC_SERVER_URL: undefined,
    })
  })

  it('returns localhost in development without overrides', () => {
    expect(getServerSideURL()).toBe('http://localhost:3000')
  })

  it('respects NEXT_PUBLIC_SERVER_URL', () => {
    setEnv({ NODE_ENV: 'development', NEXT_PUBLIC_SERVER_URL: 'example.com' })
    expect(getServerSideURL()).toBe('https://example.com')
  })

  it('uses preview URL when VERCEL_ENV is preview', () => {
    setEnv({ NODE_ENV: 'development', VERCEL_ENV: 'preview', VERCEL_URL: 'my-app.vercel.app' })
    expect(getServerSideURL()).toBe('https://my-app.vercel.app')
  })
})

describe('getPayloadCsrfExtraOrigins', () => {
  beforeEach(() => {
    setEnv({
      NODE_ENV: 'production',
      PAYLOAD_CSRF_EXTRA_ORIGINS: undefined,
      __NEXT_PRIVATE_ORIGIN: undefined,
    })
  })

  it('parses comma-separated PAYLOAD_CSRF_EXTRA_ORIGINS', () => {
    setEnv({
      NODE_ENV: 'production',
      PAYLOAD_CSRF_EXTRA_ORIGINS: ' http://a.test ,http://b.test',
    })
    expect(getPayloadCsrfExtraOrigins()).toEqual(
      expect.arrayContaining(['http://a.test', 'http://b.test']),
    )
  })

  it('includes __NEXT_PRIVATE_ORIGIN when valid', () => {
    setEnv({
      NODE_ENV: 'production',
      __NEXT_PRIVATE_ORIGIN: 'http://host.test:3000/path',
    })
    expect(getPayloadCsrfExtraOrigins()).toContain('http://host.test:3000')
  })

  it('adds loopback origin in non-production', () => {
    setEnv({ NODE_ENV: 'development' })
    expect(getPayloadCsrfExtraOrigins()).toContain('http://127.0.0.1:3000')
  })
})

describe('getClientSideURL', () => {
  beforeEach(() => {
    setEnv({
      VERCEL_ENV: undefined,
      VERCEL_URL: undefined,
      VERCEL_PROJECT_PRODUCTION_URL: undefined,
      NEXT_PUBLIC_SERVER_URL: undefined,
    })
  })

  it('uses window.location in the browser', () => {
    expect(getClientSideURL()).toMatch(/^http:\/\/localhost/)
  })
})
