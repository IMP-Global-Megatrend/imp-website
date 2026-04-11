import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getServerSideURL } from '@/utilities/getURL'

import {
  fetchAllPublishedForSitemap,
  fetchArticleArchivePageUrls,
  fetchArticleCategoryIndexUrls,
} from '@/app/(frontend)/(sitemaps)/lib/fetchSitemapDocs'

/** Sitemap is derived from CMS data; refresh periodically. */
export const revalidate = 3600

const getPostsSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const SITE_URL = getServerSideURL()
    const dateFallback = new Date().toISOString()

    const docs = await fetchAllPublishedForSitemap(payload, 'posts')
    const archivePages = await fetchArticleArchivePageUrls(payload, SITE_URL, dateFallback)
    const categoryIndexes = await fetchArticleCategoryIndexUrls(payload, SITE_URL, dateFallback)

    const posts = docs.map((post) => ({
      loc: `${SITE_URL}/articles/${post.slug}`,
      lastmod: post.updatedAt || dateFallback,
    }))

    return [...posts, ...archivePages, ...categoryIndexes]
  },
  ['posts-sitemap'],
  {
    tags: ['posts-sitemap'],
  },
)

export async function GET() {
  const sitemap = await getPostsSitemap()

  return getServerSideSitemap(sitemap)
}
