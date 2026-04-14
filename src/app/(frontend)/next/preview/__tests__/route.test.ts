/**
 * @jest-environment node
 */

jest.mock('payload', () => ({
  getPayload: jest.fn(),
}))

jest.mock('@payload-config', () => ({ __esModule: true, default: Promise.resolve({}) }))

jest.mock('next/headers', () => ({
  draftMode: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))

import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

import { snapshotEnv } from '@/test-utils'

describe('GET /next/preview', () => {
  const envSnap = snapshotEnv(['PREVIEW_SECRET'])

  beforeEach(() => {
    process.env.PREVIEW_SECRET = 'preview-secret'
    jest.mocked(getPayload).mockReset()
    jest.mocked(draftMode).mockReset()
    jest.mocked(redirect).mockReset()
  })

  afterEach(() => {
    envSnap.restore()
  })

  it('returns 403 when previewSecret does not match', async () => {
    const { GET } = await import('../route')
    const res = await GET(
      new NextRequest(
        'http://localhost/next/preview?path=/foo&collection=pages&slug=home&previewSecret=wrong',
      ),
    )

    expect(res.status).toBe(403)
    expect(redirect).not.toHaveBeenCalled()
  })

  it('returns 404 when required search params are missing', async () => {
    const { GET } = await import('../route')
    const res = await GET(
      new NextRequest('http://localhost/next/preview?previewSecret=preview-secret&path=/foo'),
    )

    expect(res.status).toBe(404)
  })

  it('enables draft mode and redirects when auth succeeds', async () => {
    const enable = jest.fn()
    const disable = jest.fn()
    jest.mocked(draftMode).mockResolvedValue({ enable, disable } as never)

    const auth = jest.fn().mockResolvedValue({ user: { id: '1' } })
    const logger = { error: jest.fn() }
    jest.mocked(getPayload).mockResolvedValue({ auth, logger } as never)

    const { GET } = await import('../route')
    await GET(
      new NextRequest(
        'http://localhost/next/preview?path=/articles&collection=posts&slug=test&previewSecret=preview-secret',
      ),
    )

    expect(enable).toHaveBeenCalled()
    expect(redirect).toHaveBeenCalledWith('/articles')
  })
})
