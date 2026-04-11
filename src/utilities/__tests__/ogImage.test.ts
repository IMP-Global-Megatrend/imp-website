import { ogArchiveImagePath, ogImagePathForRoute, ogPageImagePath, ogPostImagePath } from '../ogImage'

describe('ogPageImagePath', () => {
  it('builds a safe path for a slug', () => {
    expect(ogPageImagePath('About Us')).toBe('/images/og/generated/pages/about-us.jpg')
  })

  it('defaults to home when slug is empty after sanitization', () => {
    expect(ogPageImagePath('')).toBe('/images/og/generated/pages/home.jpg')
  })
})

describe('ogPostImagePath', () => {
  it('uses archive image when slug is empty', () => {
    expect(ogPostImagePath('', 'articles')).toBe('/images/og/generated/archives/articles.jpg')
  })

  it('builds path under posts or articles', () => {
    expect(ogPostImagePath('My Post', 'posts')).toBe('/images/og/generated/posts/my-post.jpg')
  })
})

describe('ogArchiveImagePath', () => {
  it('sanitizes key and defaults when empty', () => {
    expect(ogArchiveImagePath('Search')).toBe('/images/og/generated/archives/search.jpg')
    expect(ogArchiveImagePath('')).toBe('/images/og/generated/archives/posts.jpg')
  })
})

describe('ogImagePathForRoute', () => {
  it('maps home and archive routes', () => {
    expect(ogImagePathForRoute('/')).toBe(ogPageImagePath('home'))
    expect(ogImagePathForRoute('/posts')).toBe(ogArchiveImagePath('posts'))
    expect(ogImagePathForRoute('/articles')).toBe(ogArchiveImagePath('articles'))
    expect(ogImagePathForRoute('/search')).toBe(ogArchiveImagePath('search'))
  })

  it('maps paginated archives', () => {
    expect(ogImagePathForRoute('/posts/page/2')).toBe(ogArchiveImagePath('posts'))
    expect(ogImagePathForRoute('/articles/page/3')).toBe(ogArchiveImagePath('articles'))
  })

  it('maps single post and article slugs', () => {
    expect(ogImagePathForRoute('/posts/hello-world')).toBe(ogPostImagePath('hello-world', 'posts'))
    expect(ogImagePathForRoute('/articles/foo')).toBe(ogPostImagePath('foo', 'articles'))
  })

  it('maps article category routes', () => {
    expect(ogImagePathForRoute('/articles/category/tech')).toBe(
      ogArchiveImagePath('article-category-tech'),
    )
    expect(ogImagePathForRoute('/articles/category/tech/page/2')).toBe(
      ogArchiveImagePath('article-category-tech'),
    )
  })

  it('treats other paths as CMS pages', () => {
    expect(ogImagePathForRoute('/portfolio-strategy')).toBe(ogPageImagePath('portfolio-strategy'))
  })
})
