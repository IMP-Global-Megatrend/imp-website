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

jest.mock('@/endpoints/migrate-frontend-pages', () => ({
  migrateFrontendPagesToCMS: jest.fn().mockResolvedValue({ migrated: 1 }),
}))

import { getPayload } from 'payload'

import { migrateFrontendPagesToCMS } from '@/endpoints/migrate-frontend-pages'

describe('POST /next/migrate-frontend-pages', () => {
  beforeEach(() => {
    jest.mocked(getPayload).mockReset()
    jest.mocked(migrateFrontendPagesToCMS).mockClear()
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
    expect(migrateFrontendPagesToCMS).not.toHaveBeenCalled()
  })

  it('returns 200 when migration succeeds', async () => {
    const payload = {
      auth: jest.fn().mockResolvedValue({ user: { id: '1' } }),
      logger: { error: jest.fn() },
    }
    jest.mocked(getPayload).mockResolvedValue(payload as never)

    const { POST } = await import('../route')
    const res = await POST()

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual(expect.objectContaining({ success: true }))
    expect(migrateFrontendPagesToCMS).toHaveBeenCalled()
  })
})
