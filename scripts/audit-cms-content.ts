// @ts-nocheck
import config from '@payload-config'
import { getPayload } from 'payload'

type AnyRecord = Record<string, unknown>

function richTextParagraphCount(richText: unknown): number {
  const root = (richText as { root?: { children?: Array<Record<string, unknown>> } } | null)?.root
  const children = Array.isArray(root?.children) ? root.children : []
  return children.length
}

function isNonEmptyString(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0
}

async function main() {
  const payload = await getPayload({ config })

  const slugs = [
    'home',
    'fund',
    'megatrends',
    'portfolio-strategy',
    'performance-analysis',
    'about-us',
    'contact-us',
    'newsletter-subscription',
    'privacy-policy',
    'legal-information',
  ]

  const pageResult = await payload.find({
    collection: 'pages',
    where: { slug: { in: slugs } },
    limit: 100,
    pagination: false,
    depth: 0,
  })

  const pagesBySlug = new Map<string, AnyRecord>()
  for (const doc of pageResult.docs as AnyRecord[]) {
    pagesBySlug.set(String(doc.slug), doc)
  }

  const pageAudit = slugs.map((slug) => {
    const doc = pagesBySlug.get(slug)
    if (!doc) return { slug, exists: false }

    const layout = Array.isArray(doc.layout) ? doc.layout : []
    const heroParagraphs = richTextParagraphCount((doc.hero as AnyRecord | undefined)?.richText)

    return {
      slug,
      exists: true,
      heroParagraphs,
      layoutBlocks: layout.length,
      hasHeroCtaLabel: isNonEmptyString(doc.heroCtaLabel),
      hasHeroCtaHref: isNonEmptyString(doc.heroCtaHref),
      hasAboutUsVideo: Boolean(doc.aboutUsVideo),
      hasContactCompanyName: isNonEmptyString(doc.contactCompanyName),
      hasContactAddress: isNonEmptyString(doc.contactAddress),
      hasContactEmail: isNonEmptyString(doc.contactEmail),
      hasNewsletterIntroTitle: isNonEmptyString(doc.newsletterIntroTitle),
      hasNewsletterIntroBody: isNonEmptyString(doc.newsletterIntroBody),
      hasNewsletterConsentText: isNonEmptyString(doc.newsletterConsentText),
      hasNewsletterSubmitLabel: isNonEmptyString(doc.newsletterSubmitLabel),
    }
  })

  const [trendDataset, trendDetail, trustList, homepageLinks, fundAttrs, fundDetails] = await Promise.all([
    payload.find({ collection: 'megatrend-dataset', limit: 200, pagination: false, depth: 0 }),
    payload.find({ collection: 'megatrends-detail', limit: 200, pagination: false, depth: 0 }),
    payload.find({ collection: 'trust-list', limit: 200, pagination: false, depth: 0 }),
    payload.find({ collection: 'homepage-links', limit: 50, pagination: false, depth: 0 }),
    payload.find({ collection: 'fund-attributes', limit: 300, pagination: false, depth: 0 }),
    payload.find({ collection: 'fund-details', limit: 50, pagination: false, depth: 0 }),
  ])

  const summary = {
    pages: pageAudit,
    payloadCollections: {
      megatrendDatasetCount: trendDataset.totalDocs,
      megatrendDetailCount: trendDetail.totalDocs,
      trustListCount: trustList.totalDocs,
      homepageLinksCount: homepageLinks.totalDocs,
      fundAttributesCount: fundAttrs.totalDocs,
      fundDetailsCount: fundDetails.totalDocs,
    },
  }

  console.log(JSON.stringify(summary, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
