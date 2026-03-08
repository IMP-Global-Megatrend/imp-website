// @ts-nocheck
import config from '@payload-config'
import { getPayload } from 'payload'

async function main() {
  const payload = await getPayload({ config })
  const pages = await payload.find({
    collection: 'pages',
    where: {
      slug: {
        in: ['home', 'newsletter-subscription', 'contact-us', 'fund', 'performance-analysis'],
      },
    },
    limit: 20,
    pagination: false,
    depth: 0,
  })

  for (const doc of pages.docs as Array<Record<string, unknown>>) {
    const slug = String(doc.slug ?? '')
    console.log(
      JSON.stringify(
        {
          slug,
          title: doc.title,
          heroCtaLabel: doc.heroCtaLabel,
          heroCtaHref: doc.heroCtaHref,
          newsletterIntroTitle: doc.newsletterIntroTitle,
          newsletterSubmitLabel: doc.newsletterSubmitLabel,
          contactCompanyName: doc.contactCompanyName,
        },
        null,
        2,
      ),
    )
  }

  const trust = await payload.find({
    collection: 'trust-list',
    limit: 1,
    pagination: false,
    depth: 0,
  })
  const trends = await payload.find({
    collection: 'megatrend-dataset',
    limit: 1,
    pagination: false,
    depth: 0,
  })
  const links = await payload.find({
    collection: 'homepage-links',
    limit: 1,
    pagination: false,
    depth: 0,
  })
  console.log(
    JSON.stringify(
      {
        trustCount: trust.totalDocs,
        trendsCount: trends.totalDocs,
        linksCount: links.totalDocs,
      },
      null,
      2,
    ),
  )
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
