import { buildStaticPageParams, canonicalPathForPage } from '../archivePagination'

describe('canonicalPathForPage', () => {
  it('returns base path for page 1', () => {
    expect(canonicalPathForPage('/articles', 1)).toBe('/articles')
  })

  it('returns paginated path for page 2 and above', () => {
    expect(canonicalPathForPage('/articles', 2)).toBe('/articles/page/2')
    expect(canonicalPathForPage('/posts', 10)).toBe('/posts/page/10')
  })
})

describe('buildStaticPageParams', () => {
  it('returns empty array when a single page of results fits in one page', () => {
    expect(buildStaticPageParams(12, 12)).toEqual([])
    expect(buildStaticPageParams(5, 12)).toEqual([])
  })

  it('returns params for pages 2 through totalPages', () => {
    expect(buildStaticPageParams(25, 12)).toEqual([
      { pageNumber: '2' },
      { pageNumber: '3' },
    ])
  })
})
