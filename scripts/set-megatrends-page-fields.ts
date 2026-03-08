// @ts-nocheck
import dotenv from 'dotenv'
import path from 'node:path'
import megatrendsContent from '@/constants/megatrends-content.json'

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
    where: { slug: { equals: 'megatrends' } },
    limit: 1,
    pagination: false,
    depth: 0,
  })
  const page = pageResult.docs?.[0]
  if (!page) throw new Error('megatrends page not found.')

  await payload.update({
    collection: 'pages',
    id: page.id,
    depth: 0,
    data: {
      megatrendsHeroTitle: megatrendsContent.hero.title,
      megatrendsHeroSubtitle: megatrendsContent.hero.subtitle,
      megatrendsIntroHeading: megatrendsContent.intro.heading,
      megatrendsIntroLeftQuote: megatrendsContent.intro.leftQuote,
      megatrendsIntroRightQuote: megatrendsContent.intro.rightQuote,
      megatrendsRelatedLinksHeading: megatrendsContent.relatedLinks.heading,
      megatrendsRelatedPrimaryLabel: megatrendsContent.relatedLinks.primaryLabel,
      megatrendsRelatedPrimaryHref: '/portfolio-strategy',
      megatrendsRelatedSecondaryLabel: megatrendsContent.relatedLinks.secondaryLabel,
      megatrendsRelatedSecondaryHref: '/portfolio-strategy',
      megatrendsThematicFrameworkHeading: megatrendsContent.thematicFramework.heading,
      megatrendsThematicFrameworkLeftQuote: megatrendsContent.thematicFramework.leftQuote,
      megatrendsThematicFrameworkRightQuote: megatrendsContent.thematicFramework.rightQuote,
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
        updated: true,
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
