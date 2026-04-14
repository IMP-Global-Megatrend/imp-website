/**
 * @jest-environment node
 */

jest.mock('../../../../../payload.config', () => ({ __esModule: true, default: {} }))

jest.mock('@payloadcms/next/css', () => ({}))

jest.mock('@payloadcms/next/routes', () => ({
  REST_GET: jest.fn(() => async () => new Response('get', { status: 200 })),
  REST_POST: jest.fn(() => async () => new Response('post', { status: 200 })),
  REST_DELETE: jest.fn(() => async () => new Response('delete', { status: 200 })),
  REST_PATCH: jest.fn(() => async () => new Response('patch', { status: 200 })),
  REST_PUT: jest.fn(() => async () => new Response('put', { status: 200 })),
  REST_OPTIONS: jest.fn(() => async () => new Response(null, { status: 204 })),
}))

import {
  REST_DELETE,
  REST_GET,
  REST_OPTIONS,
  REST_PATCH,
  REST_POST,
  REST_PUT,
} from '@payloadcms/next/routes'

describe('(payload) /api/[...slug] route', () => {
  beforeEach(() => {
    jest.mocked(REST_GET).mockClear()
    jest.mocked(REST_POST).mockClear()
    jest.mocked(REST_DELETE).mockClear()
    jest.mocked(REST_PATCH).mockClear()
    jest.mocked(REST_PUT).mockClear()
    jest.mocked(REST_OPTIONS).mockClear()
  })

  it('exports REST handlers wired to Payload config', async () => {
    const route = await import('../route')

    expect(typeof route.GET).toBe('function')
    expect(typeof route.POST).toBe('function')
    expect(typeof route.DELETE).toBe('function')
    expect(typeof route.PATCH).toBe('function')
    expect(typeof route.PUT).toBe('function')
    expect(typeof route.OPTIONS).toBe('function')

    expect(REST_GET).toHaveBeenCalled()
    const ctx = {} as never
    expect(await route.GET(new Request('http://localhost/api/pages'), ctx)).toMatchObject({ status: 200 })
    expect(
      await route.POST(new Request('http://localhost/api/pages', { method: 'POST' }), ctx),
    ).toMatchObject({
      status: 200,
    })
  })
})
