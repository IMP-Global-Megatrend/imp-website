import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getServerSideURL } from '@/utilities/getURL'

import {
  fetchAllAdvisorsForSitemap,
  fetchAllPublishedForSitemap,
} from '@/app/(frontend)/(sitemaps)/lib/fetchSitemapDocs'

export const revalidate = 3600

const getPagesSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const SITE_URL = getServerSideURL()
    const dateFallback = new Date().toISOString()

    const [docs, advisors] = await Promise.all([
      fetchAllPublishedForSitemap(payload, 'pages'),
      fetchAllAdvisorsForSitemap(payload),
    ])
    const slugs = new Set(docs.map((d) => d.slug))

    const defaultSitemap: Array<{ loc: string; lastmod: string }> = []
    if (!slugs.has('search')) {
      defaultSitemap.push({ loc: `${SITE_URL}/search`, lastmod: dateFallback })
    }
    if (!slugs.has('articles')) {
      defaultSitemap.push({ loc: `${SITE_URL}/articles`, lastmod: dateFallback })
    }

    const pages = docs.map((page) => ({
      loc: page.slug === 'home' ? `${SITE_URL}/` : `${SITE_URL}/${page.slug}`,
      lastmod: page.updatedAt || dateFallback,
    }))

    const advisorPages = advisors.map((a) => ({
      loc: `${SITE_URL}/advisors/${a.slug}`,
      lastmod: a.updatedAt || dateFallback,
    }))

    return [...defaultSitemap, ...pages, ...advisorPages]
  },
  ['pages-sitemap'],
  {
    tags: ['pages-sitemap'],
  },
)

export async function GET() {
  const sitemap = await getPagesSitemap()

  return getServerSideSitemap(sitemap)
}
