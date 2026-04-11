import type { Payload } from 'payload'

import { ARTICLE_ARCHIVE_PAGE_SIZE } from '@/app/(frontend)/articles/_lib/constants'

const BATCH_SIZE = 250

type SitemapCollection = 'pages' | 'posts'

/**
 * Fetch every published document for sitemap generation. Payload caps a single
 * `find` call (e.g. limit 1000); we page until `hasNextPage` is false.
 */
export async function fetchAllPublishedForSitemap(
  payload: Payload,
  collection: SitemapCollection,
): Promise<Array<{ slug: string; updatedAt: string }>> {
  const out: Array<{ slug: string; updatedAt: string }> = []
  let page = 1

  for (;;) {
    const result = await payload.find({
      collection,
      overrideAccess: true,
      draft: false,
      depth: 0,
      limit: BATCH_SIZE,
      page,
      pagination: true,
      where: {
        _status: {
          equals: 'published',
        },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    for (const doc of result.docs) {
      const slug = doc?.slug
      if (typeof slug === 'string' && slug.length > 0) {
        const raw = doc.updatedAt as string | undefined
        const updatedAt =
          typeof raw === 'string' && raw.length > 0 ? raw : new Date().toISOString()
        out.push({ slug, updatedAt })
      }
    }

    if (!result.hasNextPage) break
    page += 1
  }

  return out
}

/** Paginated article index URLs: `/articles/page/2`, … (page 1 is `/articles`). */
export async function fetchArticleArchivePageUrls(
  payload: Payload,
  siteUrl: string,
  lastmodFallback: string,
): Promise<Array<{ loc: string; lastmod: string }>> {
  const meta = await payload.find({
    collection: 'posts',
    overrideAccess: true,
    draft: false,
    depth: 0,
    limit: ARTICLE_ARCHIVE_PAGE_SIZE,
    page: 1,
    pagination: true,
    where: {
      _status: { equals: 'published' },
    },
    select: { slug: true },
  })

  const totalPages = meta.totalPages ?? 1
  if (totalPages <= 1) return []

  const entries: Array<{ loc: string; lastmod: string }> = []
  for (let p = 2; p <= totalPages; p++) {
    entries.push({
      loc: `${siteUrl}/articles/page/${p}`,
      lastmod: lastmodFallback,
    })
  }
  return entries
}

/** One entry per category index: `/articles/category/{slug}`. */
export async function fetchArticleCategoryIndexUrls(
  payload: Payload,
  siteUrl: string,
  lastmodFallback: string,
): Promise<Array<{ loc: string; lastmod: string }>> {
  const out: Array<{ loc: string; lastmod: string }> = []
  let page = 1

  for (;;) {
    const result = await payload.find({
      collection: 'categories',
      overrideAccess: true,
      depth: 0,
      limit: BATCH_SIZE,
      page,
      pagination: true,
      select: { slug: true },
    })

    for (const doc of result.docs) {
      const slug = doc?.slug
      if (typeof slug === 'string' && slug.length > 0) {
        out.push({
          loc: `${siteUrl}/articles/category/${slug}`,
          lastmod: lastmodFallback,
        })
      }
    }

    if (!result.hasNextPage) break
    page += 1
  }

  return out
}
