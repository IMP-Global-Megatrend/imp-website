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
  exclude: ['/posts-sitemap.xml', '/pages-sitemap.xml', '/*', '/posts/*'],
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
