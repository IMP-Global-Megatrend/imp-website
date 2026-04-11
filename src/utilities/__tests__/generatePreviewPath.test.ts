import type { PayloadRequest } from 'payload'
import { generatePreviewPath } from '../generatePreviewPath'

const minimalReq = {} as PayloadRequest

describe('generatePreviewPath', () => {
  const originalSecret = process.env.PREVIEW_SECRET

  afterEach(() => {
    process.env.PREVIEW_SECRET = originalSecret
  })

  it('returns null when slug is null or undefined', () => {
    expect(
      generatePreviewPath({ collection: 'posts', slug: null as unknown as string, req: minimalReq }),
    ).toBeNull()
    expect(
      generatePreviewPath({
        collection: 'posts',
        slug: undefined as unknown as string,
        req: minimalReq,
      }),
    ).toBeNull()
  })

  it('builds preview URL with encoded slug and collection', () => {
    process.env.PREVIEW_SECRET = 'secret-value'
    const url = generatePreviewPath({
      collection: 'posts',
      slug: 'hello world',
      req: minimalReq,
    })
    expect(url).toContain('/next/preview?')
    expect(url).toContain('collection=posts')
    expect(url).toContain(encodeURIComponent(encodeURIComponent('hello world')))
    expect(url).toContain('previewSecret=secret-value')
    expect(url).toContain('path=%2Fposts%2F')
  })

  it('allows empty slug string for homepage-style previews', () => {
    process.env.PREVIEW_SECRET = ''
    const url = generatePreviewPath({ collection: 'pages', slug: '', req: minimalReq })
    expect(url).toContain('slug=')
    expect(url).toContain('path=%2F')
  })
})
