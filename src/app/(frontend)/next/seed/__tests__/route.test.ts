/**
 * @jest-environment node
 */

jest.mock('payload', () => ({
  getPayload: jest.fn(),
  createLocalReq: jest.fn(),
}))

jest.mock('@payload-config', () => ({ __esModule: true, default: {} }))

jest.mock('next/headers', () => ({
  headers: jest.fn(async () => new Headers()),
}))

jest.mock('@/endpoints/seed', () => ({
  seed: jest.fn().mockResolvedValue(undefined),
}))

import { createLocalReq, getPayload } from 'payload'

import { seed } from '@/endpoints/seed'

describe('POST /next/seed', () => {
  beforeEach(() => {
    jest.mocked(getPayload).mockReset()
    jest.mocked(createLocalReq).mockReset()
    jest.mocked(seed).mockClear()
  })

  it('returns 403 when user is not authenticated', async () => {
    const payload = {
      auth: jest.fn().mockResolvedValue({ user: null }),
      logger: { error: jest.fn() },
    }
    jest.mocked(getPayload).mockResolvedValue(payload as never)

    const { POST } = await import('../route')
    const res = await POST()

    expect(res.status).toBe(403)
    expect(seed).not.toHaveBeenCalled()
  })

  it('runs seed when authenticated', async () => {
    const payload = {
      auth: jest.fn().mockResolvedValue({ user: { id: '1' } }),
      logger: { error: jest.fn() },
    }
    jest.mocked(getPayload).mockResolvedValue(payload as never)
    jest.mocked(createLocalReq).mockResolvedValue({} as never)

    const { POST } = await import('../route')
    const res = await POST()

    expect(res.status).toBe(200)
    expect(seed).toHaveBeenCalled()
  })
})
