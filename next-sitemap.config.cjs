const withProtocol = (value) =>
  value.startsWith('http://') || value.startsWith('https://') ? value : `https://${value}`
const trimTrailingSlash = (value) => value.replace(/\/+$/, '')
const configuredURL = process.env.NEXT_PUBLIC_SERVER_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL
const SITE_URL = configuredURL
  ? trimTrailingSlash(withProtocol(configuredURL))
  : 'https://www.impgmtfund.com'

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: true,
  /**
   * Do not use `/*` here — it removes every path from the build manifest, so next-sitemap writes
   * only the index (`sitemap.xml`) and no `sitemap-*.xml` urlsets (`sitemaps: 0` in the CLI summary).
   * CMS-driven URLs stay in `/pages-sitemap.xml` and `/posts-sitemap.xml` (App Router); this list only
   * excludes admin, APIs, preview, and routes that must not appear in the static urlset.
   */
  exclude: [
    '/admin',
    '/admin/*',
    '/cms',
    '/cms/*',
    '/api',
    '/api/*',
    '/next',
    '/next/*',
    '/preview',
    '/preview/*',
    '/og-home-hero',
    '/og',
    '/og/*',
    '/_not-found',
    '/pages-sitemap.xml',
    '/posts-sitemap.xml',
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        disallow: '/admin/*',
      },
    ],
    additionalSitemaps: [`${SITE_URL}/pages-sitemap.xml`, `${SITE_URL}/posts-sitemap.xml`],
  },
}
