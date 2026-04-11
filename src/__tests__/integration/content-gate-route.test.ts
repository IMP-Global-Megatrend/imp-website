/**
 * @jest-environment node
 */

jest.mock('payload', () => ({
  getPayload: jest.fn(),
}))

jest.mock('@payload-config', () => ({ __esModule: true, default: {} }))

jest.mock('next/headers', () => ({
  headers: jest.fn(async () => new Headers()),
}))

import { getPayload } from 'payload'

describe('POST /api/content-gate (route handler)', () => {
  it('returns 400 and does not touch Payload when selectedCountry is missing', async () => {
    const { POST } = await import('@/app/(frontend)/api/content-gate/route')

    const res = await POST(
      new Request('http://localhost/api/content-gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '/some-page' }),
      }),
    )

    expect(res.status).toBe(400)
    expect(jest.mocked(getPayload)).not.toHaveBeenCalled()
  })
})
