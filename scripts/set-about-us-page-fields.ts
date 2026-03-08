// @ts-nocheck
import dotenv from 'dotenv'
import path from 'node:path'
import aboutUsContent from '@/constants/about-us-content.json'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function main() {
  const [{ default: config }, { getPayload }] = await Promise.all([
    import('@payload-config'),
    import('payload'),
  ])
  const payload = await getPayload({ config })

  const pageResult = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'about-us' } },
    limit: 1,
    pagination: false,
    depth: 0,
  })

  const page = pageResult.docs?.[0]
  if (!page) throw new Error('about-us page not found.')

  await payload.update({
    collection: 'pages',
    id: page.id,
    depth: 0,
    data: {
      aboutUsHeroTitle: aboutUsContent.hero.title,
      aboutUsVideoAriaLabel: aboutUsContent.media.videoAriaLabel,
      aboutUsQuoteText: aboutUsContent.quote.text,
      aboutUsQuoteAttributionPrimary: aboutUsContent.quote.attributionLines[0] || '',
      aboutUsQuoteAttributionSecondary: aboutUsContent.quote.attributionLines[1] || '',
      aboutUsProfiles: aboutUsContent.profiles.map((profile) => ({
        name: profile.name,
        paragraphs: profile.paragraphs.map((text) => ({ text })),
        certifications: profile.certifications.map((certification) => ({
          title: certification.title,
          institution: certification.institution,
        })),
      })),
      aboutUsHighlights: aboutUsContent.highlights.map((item) => ({
        id: item.id,
        text: item.text,
        line1: item.line1 || '',
        line2: item.line2 || '',
      })),
      aboutUsRequestCallLabel: aboutUsContent.ctas.requestCall.label,
      aboutUsRequestCallHref: aboutUsContent.ctas.requestCall.href,
      aboutUsLinkedinLabel: aboutUsContent.ctas.linkedin.label,
      aboutUsLinkedinHref: aboutUsContent.ctas.linkedin.href,
      aboutUsLinkedinAriaLabel: aboutUsContent.social.linkedinAriaLabel,
    },
    context: {
      disableRevalidate: true,
    },
  })

  console.log(
    JSON.stringify(
      {
        success: true,
        pageId: page.id,
        profileCount: aboutUsContent.profiles.length,
        highlightCount: aboutUsContent.highlights.length,
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
