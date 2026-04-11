/**
 * @jest-environment node
 */

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

import { revalidatePath } from 'next/cache'
import { NextRequest } from 'next/server'

describe('GET /next/revalidate (route handler)', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    jest.mocked(revalidatePath).mockClear()
  })

  afterEach(() => {
    process.env = { ...originalEnv } as NodeJS.ProcessEnv
  })

  it('returns 500 when REVALIDATE_SECRET is not configured', async () => {
    process.env = { ...originalEnv } as NodeJS.ProcessEnv
    Reflect.deleteProperty(process.env, 'REVALIDATE_SECRET')

    const { GET } = await import('@/app/(frontend)/next/revalidate/route')
    const res = await GET(
      new NextRequest('http://localhost/next/revalidate?secret=any&path=/foo'),
    )

    expect(res.status).toBe(500)
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('returns 401 when the secret does not match', async () => {
    process.env = { ...originalEnv, REVALIDATE_SECRET: 'expected' } as NodeJS.ProcessEnv

    const { GET } = await import('@/app/(frontend)/next/revalidate/route')
    const res = await GET(
      new NextRequest('http://localhost/next/revalidate?secret=wrong&path=/foo'),
    )

    expect(res.status).toBe(401)
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('returns 400 when path is missing or not root-relative', async () => {
    process.env = { ...originalEnv, REVALIDATE_SECRET: 'expected' } as NodeJS.ProcessEnv

    const { GET } = await import('@/app/(frontend)/next/revalidate/route')

    let res = await GET(new NextRequest('http://localhost/next/revalidate?secret=expected'))
    expect(res.status).toBe(400)

    res = await GET(
      new NextRequest('http://localhost/next/revalidate?secret=expected&path=missing-slash'),
    )
    expect(res.status).toBe(400)
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('calls revalidatePath and returns success JSON', async () => {
    process.env = { ...originalEnv, REVALIDATE_SECRET: 'expected' } as NodeJS.ProcessEnv

    const { GET } = await import('@/app/(frontend)/next/revalidate/route')
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
  })
})
