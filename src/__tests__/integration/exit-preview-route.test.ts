/**
 * @jest-environment node
 */

jest.mock('next/headers', () => ({
  draftMode: jest.fn(),
}))

import { draftMode } from 'next/headers'

describe('GET /next/exit-preview (route handler)', () => {
  it('disables draft mode and returns a confirmation body', async () => {
    const disable = jest.fn()
    jest.mocked(draftMode).mockResolvedValue({ disable } as unknown as Awaited<ReturnType<typeof draftMode>>)

    const { GET } = await import('@/app/(frontend)/next/exit-preview/route')
    const res = await GET()

    expect(disable).toHaveBeenCalledTimes(1)
    expect(res.status).toBe(200)
    expect(await res.text()).toContain('disabled')
  })
})
