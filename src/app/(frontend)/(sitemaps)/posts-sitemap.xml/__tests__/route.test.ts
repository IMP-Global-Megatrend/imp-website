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

describe('GET posts-sitemap.xml', () => {
  beforeEach(() => {
    jest.mocked(getPayload).mockReset()
    jest.mocked(getServerSideSitemap).mockClear()
  })

  it('returns a sitemap response built from CMS data', async () => {
    const find = jest.fn(async (args: { collection: string; where?: { _status?: { equals: string } } }) => {
      if (args.collection === 'posts' && args.where?._status?.equals === 'published') {
        return {
          docs: [{ slug: 'hello-world', updatedAt: '2024-01-01T00:00:00.000Z' }],
          hasNextPage: false,
          totalPages: 1,
        }
      }
      if (args.collection === 'posts') {
        return { docs: [], hasNextPage: false, totalPages: 1 }
      }
      if (args.collection === 'categories') {
        return { docs: [], hasNextPage: false }
      }
      return { docs: [], hasNextPage: false, totalPages: 1 }
    })

    jest.mocked(getPayload).mockResolvedValue({ find } as never)

    const { GET } = await import('../route')
    const res = await GET()

    expect(res.status).toBe(200)
    expect(getServerSideSitemap).toHaveBeenCalled()
    const entries = jest.mocked(getServerSideSitemap).mock.calls[0]?.[0] as Array<{ loc: string }>
    expect(entries.some((e) => e.loc.includes('/articles/hello-world'))).toBe(true)
  })
})
