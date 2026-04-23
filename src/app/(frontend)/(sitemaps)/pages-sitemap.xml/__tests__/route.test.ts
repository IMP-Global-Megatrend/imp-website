/**
 * @jest-environment node
 */

jest.mock('next/cache', () => ({
  unstable_cache: (fn: () => Promise<unknown>) => {
    return async () => await fn()
  },
}))

jest.mock('payload', () => ({
  getPayload: jest.fn(),
}))

jest.mock('@payload-config', () => ({ __esModule: true, default: {} }))

jest.mock('next-sitemap', () => ({
  getServerSideSitemap: jest.fn(async () => new Response('<urlset />', { status: 200 })),
}))

import { getPayload } from 'payload'
import { getServerSideSitemap } from 'next-sitemap'

describe('GET pages-sitemap.xml', () => {
  beforeEach(() => {
    jest.mocked(getPayload).mockReset()
    jest.mocked(getServerSideSitemap).mockClear()
  })

  it('returns a sitemap response including published pages', async () => {
    const find = jest.fn(
      async (args: { collection: string; where?: { _status?: { equals: string } } }) => {
        if (args.collection === 'pages' && args.where?._status?.equals === 'published') {
          return {
            docs: [
              { slug: 'home', updatedAt: '2024-01-01T00:00:00.000Z' },
              { slug: 'about', updatedAt: '2024-02-01T00:00:00.000Z' },
            ],
            hasNextPage: false,
          }
        }
        if (args.collection === 'advisors') {
          return {
            docs: [{ slug: 'jane-doe', updatedAt: '2024-03-01T00:00:00.000Z' }],
            hasNextPage: false,
          }
        }
        return { docs: [], hasNextPage: false }
      },
    )

    jest.mocked(getPayload).mockResolvedValue({ find } as never)

    const { GET } = await import('../route')
    const res = await GET()

    expect(res.status).toBe(200)
    expect(getServerSideSitemap).toHaveBeenCalled()
    const entries = jest.mocked(getServerSideSitemap).mock.calls[0]?.[0] as Array<{ loc: string }>
    expect(entries.some((e) => e.loc.endsWith('/') || e.loc.includes('/about'))).toBe(true)
    expect(entries.some((e) => e.loc.includes('/advisors/jane-doe'))).toBe(true)
  })
})
