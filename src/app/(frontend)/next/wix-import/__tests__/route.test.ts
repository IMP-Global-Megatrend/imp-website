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

jest.mock('@/endpoints/wix-import', () => ({
  wixImport: jest.fn().mockResolvedValue({ ok: true }),
}))

import { getPayload } from 'payload'

import { wixImport } from '@/endpoints/wix-import'

import { jsonRequest } from '@/test-utils'

describe('POST /next/wix-import', () => {
  beforeEach(() => {
    jest.mocked(getPayload).mockReset()
    jest.mocked(wixImport).mockClear()
  })

  it('returns 403 when user is not authenticated', async () => {
    const payload = {
      auth: jest.fn().mockResolvedValue({ user: null }),
      logger: { error: jest.fn() },
    }
    jest.mocked(getPayload).mockResolvedValue(payload as never)

    const { POST } = await import('../route')
    const res = await POST(jsonRequest('http://localhost/next/wix-import', {}))

    expect(res.status).toBe(403)
    expect(wixImport).not.toHaveBeenCalled()
  })

  it('returns 200 and runs import when authenticated', async () => {
    const payload = {
      auth: jest.fn().mockResolvedValue({ user: { id: '1' } }),
      logger: { error: jest.fn() },
    }
    jest.mocked(getPayload).mockResolvedValue(payload as never)

    const { POST } = await import('../route')
    const res = await POST(jsonRequest('http://localhost/next/wix-import', { dryRun: true }))

    expect(res.status).toBe(200)
    expect(wixImport).toHaveBeenCalled()
  })
})
