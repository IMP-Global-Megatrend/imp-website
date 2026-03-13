const GENERATED_OG_BASE_PATH = '/images/og/generated'
const GENERATED_OG_EXTENSION = 'jpg'

function trimSlashes(value: string): string {
  return value.replace(/^\/+/, '').replace(/\/+$/, '')
}

function toSafeSegment(value: string): string {
  return trimSlashes(value)
    .toLowerCase()
    .replace(/[^a-z0-9/_-]+/g, '-')
    .replace(/\/{2,}/g, '/')
    .replace(/-+/g, '-')
}

export function ogPageImagePath(slug: string): string {
  const safeSlug = toSafeSegment(slug) || 'home'
  return `${GENERATED_OG_BASE_PATH}/pages/${safeSlug}.${GENERATED_OG_EXTENSION}`
}

export function ogPostImagePath(slug: string, section: 'posts' | 'articles' = 'posts'): string {
  const safeSlug = toSafeSegment(slug)
  if (!safeSlug) return `${GENERATED_OG_BASE_PATH}/archives/${section}.${GENERATED_OG_EXTENSION}`
  return `${GENERATED_OG_BASE_PATH}/${section}/${safeSlug}.${GENERATED_OG_EXTENSION}`
}

export function ogArchiveImagePath(key: string): string {
  const safeKey = toSafeSegment(key) || 'posts'
  return `${GENERATED_OG_BASE_PATH}/archives/${safeKey}.${GENERATED_OG_EXTENSION}`
}

export function ogImagePathForRoute(routePath: string): string {
  const normalized = routePath.startsWith('/') ? routePath : `/${routePath}`
  const cleanPath = normalized.replace(/\/+$/, '') || '/'

  if (cleanPath === '/') return ogPageImagePath('home')

  if (cleanPath === '/posts' || cleanPath.startsWith('/posts/page/')) {
    return ogArchiveImagePath('posts')
  }

  if (cleanPath === '/articles' || cleanPath.startsWith('/articles/page/')) {
    return ogArchiveImagePath('articles')
  }

  if (cleanPath === '/search') {
    return ogArchiveImagePath('search')
  }

  if (cleanPath.startsWith('/posts/')) {
    const slug = cleanPath.replace('/posts/', '')
    return ogPostImagePath(slug, 'posts')
  }

  if (cleanPath.startsWith('/articles/category/')) {
    const categorySlug = cleanPath
      .replace('/articles/category/', '')
      .replace(/\/page\/\d+$/, '')
    return ogArchiveImagePath(`article-category-${categorySlug}`)
  }

  if (cleanPath.startsWith('/articles/')) {
    const slug = cleanPath.replace('/articles/', '')
    return ogPostImagePath(slug, 'articles')
  }

  return ogPageImagePath(cleanPath.slice(1))
}

