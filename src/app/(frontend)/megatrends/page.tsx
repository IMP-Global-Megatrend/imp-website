import type { Metadata } from 'next'
import { getCMSMegatrendImageVariantsByTitle, getCMSPageBySlug } from '../_components/getCMSPageBySlug'
import { PageHero } from '../_components/PageHero'
import { MegatrendDetailSection } from '../_components/MegatrendDetailSection'
import { ActionLinkButton } from '../_components/ActionLinkButton'
import megatrendsContent from '@/constants/megatrends-content.json'
import fallbacks from '@/constants/fallbacks.json'
import { generateMeta } from '@/utilities/generateMeta'

export async function generateMetadata(): Promise<Metadata> {
  const cmsPage = await getCMSPageBySlug('megatrends')
  if (cmsPage) return generateMeta({ doc: cmsPage })

  return fallbacks.metadata.megatrends
}

const megatrends = megatrendsContent.megatrends

export default async function MegatrendsPage() {
  const trendImageVariantsByTitle = await getCMSMegatrendImageVariantsByTitle()

  return (
    <main className="bg-white text-[#0b1035]">
        <PageHero
          title={megatrendsContent.hero.title}
          subtitle={megatrendsContent.hero.subtitle}
          palette={{ color1: '#2b3dea', color2: 'oklch(0.47 0.12 174)', color3: 'oklch(0.47 0.10 136)' }}
        />

        {/* Intro */}
        <section className="bg-secondary py-20 md:py-24">
          <div className="container">
            <div className="max-w-5xl space-y-6">
              <h3 className="text-white font-display font-medium leading-relaxed text-[18px] md:text-[19px]">
                {megatrendsContent.intro.heading}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6 md:gap-8">
                <blockquote className="border-l border-primary-light pl-8 pr-8 text-[#62A8FF] font-thin leading-relaxed text-[18px] md:text-[19px]">
                  {megatrendsContent.intro.leftQuote}
                </blockquote>
                <blockquote className="border-l border-primary-light pl-8 pr-8 text-[#62A8FF] font-thin leading-relaxed text-[18px] md:text-[19px]">
                  {megatrendsContent.intro.rightQuote}
                </blockquote>
              </div>
            </div>
          </div>
        </section>

        {/* Megatrend sections */}
        <div className="pb-16 md:pb-20">
          {megatrends.map((trend, idx) => (
            <MegatrendDetailSection
              id={trend.anchor}
              key={trend.title}
              index={idx}
              trend={{
                ...trend,
                icon:
                  trendImageVariantsByTitle[trend.title]?.blue ||
                  trendImageVariantsByTitle[trend.title]?.white ||
                  trend.icon ||
                  '',
              }}
              reverse={idx % 2 === 1}
              noTopBorder={idx === 0}
            />
          ))}

          <section className="border-t border-[#d9def0] pt-10 pb-0 md:pt-12 md:pb-0">
            <div className="container">
              <h3 className="mb-5 text-center text-[20px] md:text-[22px] text-[#0b1035]">
                {megatrendsContent.relatedLinks.heading}
              </h3>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <ActionLinkButton
                  href="/portfolio-strategy"
                  label={megatrendsContent.relatedLinks.primaryLabel}
                  icon="trendingUp"
                  buttonVariant="outlineMuted"
                />
                <ActionLinkButton
                  href="/portfolio-strategy"
                  label={megatrendsContent.relatedLinks.secondaryLabel}
                  icon="chartLine"
                  buttonVariant="outlineMuted"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Thematic Framework */}
        <section className="bg-secondary py-20 md:py-24">
          <div className="container">
            <div className="max-w-5xl space-y-6">
              <h3 className="text-white font-display font-medium leading-relaxed text-[18px] md:text-[19px]">
                {megatrendsContent.thematicFramework.heading}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <blockquote className="border-l border-primary-light pl-8 pr-8 text-[#62A8FF] font-thin leading-relaxed text-[18px] md:text-[19px]">
                  {megatrendsContent.thematicFramework.leftQuote}
                </blockquote>
                <blockquote className="border-l border-primary-light pl-8 pr-8 text-[#62A8FF] font-thin leading-relaxed text-[18px] md:text-[19px]">
                  {megatrendsContent.thematicFramework.rightQuote}
                </blockquote>
              </div>
            </div>
          </div>
        </section>
    </main>
  )
}
