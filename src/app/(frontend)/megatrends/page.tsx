import type { Metadata } from 'next'
import { getCMSMegatrendDetailBlocks, getCMSPageBySlug } from '@/app/(frontend)/_components/getCMSPageBySlug'
import { PageHero } from '@/app/(frontend)/_components/PageHero'
import { MegatrendDetailSection } from '@/app/(frontend)/_components/MegatrendDetailSection'
import { QuoteBandSection } from '@/app/(frontend)/_components/QuoteBandSection'
import { RelatedLinksStrip } from '@/app/(frontend)/_components/RelatedLinksStrip'
import megatrendsContent from '@/constants/megatrends-content.json'
import fallbacks from '@/constants/fallbacks.json'
import { generateMeta, generateStaticFallbackMeta } from '@/utilities/generateMeta'

export async function generateMetadata(): Promise<Metadata> {
  const cmsPage = await getCMSPageBySlug('megatrends')
  if (cmsPage) return generateMeta({ doc: cmsPage })

  return generateStaticFallbackMeta('/megatrends', fallbacks.metadata.megatrends)
}

const megatrends = megatrendsContent.megatrends

export default async function MegatrendsPage() {
  const [cmsPage, cmsMegatrendBlocks] = await Promise.all([
    getCMSPageBySlug('megatrends'),
    getCMSMegatrendDetailBlocks(),
  ])
  const page = (cmsPage && typeof cmsPage === 'object' ? cmsPage : {}) as Record<string, unknown>
  const megatrendBlocks = cmsMegatrendBlocks.length > 0 ? cmsMegatrendBlocks : megatrends

  const getText = (value: unknown): string | null => {
    if (typeof value !== 'string') return null
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }
  const getAssetHref = (value: unknown): string | null => {
    if (!value || typeof value !== 'object') return null
    const media = value as { url?: unknown }
    return getText(media.url)
  }

  const heroTitle = getText(page.megatrendsHeroTitle) || megatrendsContent.hero.title
  const heroSubtitle = getText(page.megatrendsHeroSubtitle) || megatrendsContent.hero.subtitle
  const introHeading = getText(page.megatrendsIntroHeading) || megatrendsContent.intro.heading
  const introLeftQuote = getText(page.megatrendsIntroLeftQuote) || megatrendsContent.intro.leftQuote
  const introRightQuote = getText(page.megatrendsIntroRightQuote) || megatrendsContent.intro.rightQuote
  const relatedLinksHeading =
    getText(page.megatrendsRelatedLinksHeading) || megatrendsContent.relatedLinks.heading
  const relatedPrimaryLabel =
    getText(page.megatrendsRelatedPrimaryLabel) || megatrendsContent.relatedLinks.primaryLabel
  const relatedPrimaryHref =
    getText(page.megatrendsRelatedPrimaryHref) ||
    getAssetHref(page.megatrendsRelatedPrimaryAsset) ||
    '/portfolio-strategy'
  const relatedSecondaryLabel =
    getText(page.megatrendsRelatedSecondaryLabel) || megatrendsContent.relatedLinks.secondaryLabel
  const relatedSecondaryHref =
    getText(page.megatrendsRelatedSecondaryHref) ||
    getAssetHref(page.megatrendsRelatedSecondaryAsset) ||
    '/portfolio-strategy'
  const thematicFrameworkHeading =
    getText(page.megatrendsThematicFrameworkHeading) || megatrendsContent.thematicFramework.heading
  const thematicFrameworkLeftQuote =
    getText(page.megatrendsThematicFrameworkLeftQuote) || megatrendsContent.thematicFramework.leftQuote
  const thematicFrameworkRightQuote =
    getText(page.megatrendsThematicFrameworkRightQuote) || megatrendsContent.thematicFramework.rightQuote

  return (
    <main className="bg-white text-[#0b1035]">
        <PageHero
          title={heroTitle}
          subtitle={heroSubtitle}
          palette={{ color1: '#2b3dea', color2: 'oklch(0.47 0.12 174)', color3: 'oklch(0.47 0.10 136)' }}
        />

        {/* Intro */}
        <QuoteBandSection heading={introHeading} quotes={[introLeftQuote, introRightQuote]} />

        {/* Megatrend sections */}
        <div className="pb-16 md:pb-20">
          {megatrendBlocks.map((trend, idx) => (
            <MegatrendDetailSection
              id={trend.anchor}
              key={trend.title}
              index={idx}
              trend={trend}
              reverse={idx % 2 === 1}
              noTopBorder={idx === 0}
            />
          ))}

          <RelatedLinksStrip
            className="pb-0 md:pb-0"
            borderTop
            heading={relatedLinksHeading}
            items={[
              {
                href: relatedPrimaryHref,
                label: relatedPrimaryLabel,
                icon: 'trendingUp',
                external: relatedPrimaryHref.startsWith('http://') || relatedPrimaryHref.startsWith('https://'),
              },
              {
                href: relatedSecondaryHref,
                label: relatedSecondaryLabel,
                icon: 'chartLine',
                external: relatedSecondaryHref.startsWith('http://') || relatedSecondaryHref.startsWith('https://'),
              },
            ]}
          />
        </div>

        {/* Thematic Framework */}
        <QuoteBandSection
          heading={thematicFrameworkHeading}
          quotes={[thematicFrameworkLeftQuote, thematicFrameworkRightQuote]}
        />
    </main>
  )
}
