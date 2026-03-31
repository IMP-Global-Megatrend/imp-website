import type { MetadataRoute } from 'next'

import { getServerSideURL } from '@/utilities/getURL'

/** App Router /robots.txt so production always has it (postbuild-generated public file can be missing on Vercel). */
export default function robots(): MetadataRoute.Robots {
  const base = getServerSideURL()

  return {
    rules: {
      userAgent: '*',
      disallow: ['/admin/'],
    },
    sitemap: [`${base}/pages-sitemap.xml`, `${base}/posts-sitemap.xml`],
  }
}
