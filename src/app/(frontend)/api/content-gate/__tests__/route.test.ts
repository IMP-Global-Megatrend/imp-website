/**
 * @jest-environment node
 */

jest.mock('payload', () => ({
  getPayload: jest.fn(),
}))

jest.mock('@payload-config', () => ({ __esModule: true, default: {} }))

jest.mock('next/headers', () => ({
  headers: jest.fn(async () => new Headers({ 'x-vercel-ip-country': 'US' })),
}))

import { getPayload } from 'payload'

import { createPayloadMock, jsonRequest } from '@/test-utils'

describe('POST /api/content-gate', () => {
  beforeEach(() => {
    jest.mocked(getPayload).mockReset()
  })

  it('returns 400 and does not touch Payload when selectedCountry is missing', async () => {
    const { POST } = await import('../route')

    const res = await POST(
      jsonRequest('http://localhost/api/content-gate', { path: '/some-page' }),
    )

    expect(res.status).toBe(400)
    expect(jest.mocked(getPayload)).not.toHaveBeenCalled()
  })

  it('returns 200 and creates a submission when selectedCountry is present', async () => {
    const payload = createPayloadMock({
      create: jest.fn().mockResolvedValue({}),
    })
    jest.mocked(getPayload).mockResolvedValue(payload as never)

    const { POST } = await import('../route')

    const res = await POST(
      jsonRequest('http://localhost/api/content-gate', {
        selectedCountry: 'France',
        path: '/articles',
      }),
    )

    expect(res.status).toBe(200)
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'content-gate-submissions',
        overrideAccess: true,
      }),
    )
  })
})
