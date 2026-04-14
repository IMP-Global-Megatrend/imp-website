/**
 * @jest-environment node
 */

jest.mock('../../../../../payload.config', () => ({ __esModule: true, default: {} }))

jest.mock('@payloadcms/next/css', () => ({}))

jest.mock('@payloadcms/next/routes', () => ({
  GRAPHQL_PLAYGROUND_GET: jest.fn(() => async () => new Response('<html />', { status: 200 })),
}))

import { GRAPHQL_PLAYGROUND_GET } from '@payloadcms/next/routes'

describe('(payload) /api/graphql-playground route', () => {
  beforeEach(() => {
    jest.mocked(GRAPHQL_PLAYGROUND_GET).mockClear()
  })

  it('exports GET from Payload playground helper', async () => {
    const { GET } = await import('../route')

    expect(typeof GET).toBe('function')
    expect(GRAPHQL_PLAYGROUND_GET).toHaveBeenCalled()

    const res = await GET(new Request('http://localhost/api/graphql-playground'))
    expect(res.status).toBe(200)
  })
})
