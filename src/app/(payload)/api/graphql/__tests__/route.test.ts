/**
 * @jest-environment node
 */

jest.mock('../../../../../payload.config', () => ({ __esModule: true, default: {} }))

jest.mock('@payloadcms/next/routes', () => ({
  GRAPHQL_POST: jest.fn(() => async () => new Response('ok', { status: 200 })),
  REST_OPTIONS: jest.fn(() => async () => new Response(null, { status: 204 })),
}))

import { GRAPHQL_POST, REST_OPTIONS } from '@payloadcms/next/routes'

describe('(payload) /api/graphql route', () => {
  beforeEach(() => {
    jest.mocked(GRAPHQL_POST).mockClear()
    jest.mocked(REST_OPTIONS).mockClear()
  })

  it('exports POST and OPTIONS handlers from Payload route helpers', async () => {
    const { POST, OPTIONS } = await import('../route')

    expect(typeof POST).toBe('function')
    expect(typeof OPTIONS).toBe('function')
    expect(GRAPHQL_POST).toHaveBeenCalled()
    expect(REST_OPTIONS).toHaveBeenCalled()

    const ctx = {} as never
    const postRes = await POST(new Request('http://localhost/api/graphql', { method: 'POST' }))
    expect(postRes.status).toBe(200)

    const optRes = await OPTIONS(new Request('http://localhost/api/graphql', { method: 'OPTIONS' }), ctx)
    expect(optRes.status).toBe(204)
  })
})
