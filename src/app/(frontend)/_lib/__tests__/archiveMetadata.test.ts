import { buildPaginatedArchiveMetadata } from '../archiveMetadata'

describe('buildPaginatedArchiveMetadata', () => {
  it('fills title, description, canonical, and image URLs from templates', () => {
    const meta = buildPaginatedArchiveMetadata({
      basePath: '/articles',
      pageNumber: '2',
      titleTemplate: 'Articles — page {pageNumber}',
      descriptionTemplate: 'Archive page {pageNumber}',
    })
    expect(meta.title).toBe('Articles — page 2')
    expect(meta.description).toBe('Archive page 2')
    expect(meta.alternates?.canonical).toBe('/articles/page/2')
    expect(meta.openGraph?.url).toBe('/articles/page/2')
    const ogImages = meta.openGraph?.images
    const firstOg = Array.isArray(ogImages) ? ogImages[0] : ogImages
    expect(firstOg && typeof firstOg === 'object' && 'url' in firstOg && firstOg.url).toBeTruthy()

    const twImages = meta.twitter?.images
    const firstTw = Array.isArray(twImages) ? twImages[0] : twImages
    expect(firstTw).toBeDefined()

    expect(meta.twitter?.title).toBe('Articles — page 2')
  })
})
