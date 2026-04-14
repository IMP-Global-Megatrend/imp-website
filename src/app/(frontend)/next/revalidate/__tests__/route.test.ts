/**
 * @jest-environment node
 */

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

import { revalidatePath } from 'next/cache'
import { NextRequest } from 'next/server'

import { snapshotEnv } from '@/test-utils'

describe('GET /next/revalidate', () => {
  const envKeys = ['REVALIDATE_SECRET']

  it('returns 500 when REVALIDATE_SECRET is not configured', async () => {
    const snap = snapshotEnv(envKeys)
    Reflect.deleteProperty(process.env, 'REVALIDATE_SECRET')
    jest.mocked(revalidatePath).mockClear()

    const { GET } = await import('../route')
    const res = await GET(new NextRequest('http://localhost/next/revalidate?secret=any&path=/foo'))

    expect(res.status).toBe(500)
    expect(revalidatePath).not.toHaveBeenCalled()
    snap.restore()
  })

  it('returns 401 when the secret does not match', async () => {
    const snap = snapshotEnv(envKeys)
    process.env.REVALIDATE_SECRET = 'expected'
    jest.mocked(revalidatePath).mockClear()

    const { GET } = await import('../route')
    const res = await GET(new NextRequest('http://localhost/next/revalidate?secret=wrong&path=/foo'))

    expect(res.status).toBe(401)
    expect(revalidatePath).not.toHaveBeenCalled()
    snap.restore()
  })

  it('returns 400 when path is missing or not root-relative', async () => {
    const snap = snapshotEnv(envKeys)
    process.env.REVALIDATE_SECRET = 'expected'
    jest.mocked(revalidatePath).mockClear()

    const { GET } = await import('../route')

    let res = await GET(new NextRequest('http://localhost/next/revalidate?secret=expected'))
    expect(res.status).toBe(400)

    res = await GET(new NextRequest('http://localhost/next/revalidate?secret=expected&path=missing-slash'))
    expect(res.status).toBe(400)
    expect(revalidatePath).not.toHaveBeenCalled()
    snap.restore()
  })

  it('calls revalidatePath and returns success JSON', async () => {
    const snap = snapshotEnv(envKeys)
    process.env.REVALIDATE_SECRET = 'expected'
    jest.mocked(revalidatePath).mockClear()

    const { GET } = await import('../route')
    const res = await GET(
      new NextRequest('http://localhost/next/revalidate?secret=expected&path=/portfolio'),
    )

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual(
      expect.objectContaining({
        success: true,
        revalidated: true,
        path: '/portfolio',
      }),
    )
    expect(revalidatePath).toHaveBeenCalledWith('/portfolio')
    snap.restore()
  })
})
