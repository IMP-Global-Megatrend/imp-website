import type { Metadata } from 'next'
import {
  getCMSFundDetails,
  getCMSFundIntroQuotes,
  getCMSFundShareClassMeta,
  getCMSHeroCopyBySlug,
  getCMSPageBySlug,
} from '../_components/getCMSPageBySlug'
import { ActionLinkButton } from '../_components/ActionLinkButton'
import type { AnimatedIconName } from '../_components/AnimatedIcon'
import { AnimatedIcon } from '../_components/AnimatedIcon'
import { FundShareClassesSection } from '../_components/FundShareClassesSection'
import { PageHero } from '../_components/PageHero'
import fundContent from '@/constants/fund-content.json'
import fallbacks from '@/constants/fallbacks.json'
import { generateMeta, generateStaticFallbackMeta } from '@/utilities/generateMeta'

export async function generateMetadata(): Promise<Metadata> {
  const cmsPage = await getCMSPageBySlug('fund')
  if (cmsPage) return generateMeta({ doc: cmsPage })

  return generateStaticFallbackMeta('/fund', fallbacks.metadata.fund)
}

const fallbackDetails: Array<{ label: string; value: string; icon: AnimatedIconName }> = fallbacks.fund
  .details as Array<{ label: string; value: string; icon: AnimatedIconName }>

type ShareClassContent = {
  title: string
  feeLabel: string
  feeText: string
  isin: string
  wkn: string
  bloomberg: string
}

export default async function FundPage() {
  const cmsHeroCopy = await getCMSHeroCopyBySlug('fund')
  const heroTitle = cmsHeroCopy?.title ?? fallbacks.ui.blankHeroTitle
  const heroSubtitle = cmsHeroCopy?.subtitle
  const introQuotes = await getCMSFundIntroQuotes('fund')

  const usdFallback: ShareClassContent = fallbacks.fund.shareClass.usd
  const chfFallback: ShareClassContent = fallbacks.fund.shareClass.chf

  const usdContent = usdFallback
  const chfContent = chfFallback
  const shareClassMeta = await getCMSFundShareClassMeta()
  const cmsDetails = await getCMSFundDetails()
  const details = cmsDetails?.length ? cmsDetails : fallbackDetails
  const fallbackRelatedLinks = fallbacks.fund.relatedLinks
  const relatedLinks = {
    heading: fundContent.relatedLinks.heading || fallbackRelatedLinks.heading,
    items: [
      {
        href: fundContent.relatedLinks.items[0]?.href || fallbackRelatedLinks.items[0]?.href || '#',
        label: fundContent.relatedLinks.items[0]?.label || fallbackRelatedLinks.items[0]?.label || '',
      },
      {
        href: fundContent.relatedLinks.items[1]?.href || fallbackRelatedLinks.items[1]?.href || '/performance-analysis',
        label: fundContent.relatedLinks.items[1]?.label || fallbackRelatedLinks.items[1]?.label || '',
      },
      {
        href: fundContent.relatedLinks.items[2]?.href || fallbackRelatedLinks.items[2]?.href || '/legal-information',
        label: fundContent.relatedLinks.items[2]?.label || fallbackRelatedLinks.items[2]?.label || '',
      },
    ],
  }
  const firstDetailsRow = details.slice(0, Math.min(3, details.length))
  const secondDetailsRow = details.slice(firstDetailsRow.length)

  return (
    <main className="bg-white text-[#0b1035]">
        <PageHero
          title={heroTitle}
          subtitle={heroSubtitle}
          palette={{ color1: '#2b3dea', color2: 'oklch(0.45 0.12 58)', color3: 'oklch(0.45 0.11 20)' }}
          subtitleClassName="text-white text-[19px] md:text-[21px] max-w-lg font-light"
          sectionClassName="relative overflow-hidden"
        />

        {introQuotes?.first ? (
          <section className="bg-secondary py-20 md:py-24">
            <div className="container">
              <div className="max-w-5xl space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <blockquote className="border-l border-primary-light pl-8 pr-8 text-[#62A8FF] font-thin leading-relaxed text-[18px] md:text-[19px] whitespace-pre-line">
                    {introQuotes.first}
                  </blockquote>
                  {introQuotes.second ? (
                    <blockquote className="border-l border-primary-light pl-8 pr-8 text-[#62A8FF] font-thin leading-relaxed text-[18px] md:text-[19px] whitespace-pre-line">
                      {introQuotes.second}
                    </blockquote>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section className="container pt-16 md:pt-20 pb-0 text-center">
            <h2 className="text-[13px] md:text-[14px] uppercase tracking-[0.12em] text-primary font-semibold mb-4">
              {fundContent.investmentObjective.heading}
            </h2>
            <p className="text-[22px] md:text-[28px] text-[#2b3045] leading-[1.35] italic">
              {fundContent.investmentObjective.body}
            </p>
        </section>

        <div className="mt-12">
          <FundShareClassesSection
            usdContent={usdContent}
            chfContent={chfContent}
            shareClassMeta={shareClassMeta}
          />
        </div>

        <div>
          <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen">
            <div className="w-full border-l border-t border-[#d9def0]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
                {firstDetailsRow.map(({ label, value, icon }) => (
                  <article
                    key={label}
                    className="border-r border-b border-[#d9def0] p-4 md:p-5 min-h-[110px] md:min-h-[120px]"
                  >
                    <div className="font-display inline-flex items-center gap-2 text-[13px] md:text-[14px] uppercase tracking-[0.12em] text-primary font-semibold mb-2">
                      <AnimatedIcon name={icon as AnimatedIconName} size={14} className="text-primary shrink-0" />
                      {label}
                    </div>
                    <p className="text-[16px] md:text-[17px] leading-[1.35] text-[#2b3045]">{value}</p>
                  </article>
                ))}
              </div>
              {secondDetailsRow.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-0">
                  {secondDetailsRow.map(({ label, value, icon }) => (
                    <article
                      key={label}
                      className="border-r border-b border-[#d9def0] p-4 md:p-5 min-h-[110px] md:min-h-[120px]"
                    >
                      <div className="font-display inline-flex items-center gap-2 text-[13px] md:text-[14px] uppercase tracking-[0.12em] text-primary font-semibold mb-2">
                        <AnimatedIcon name={icon as AnimatedIconName} size={14} className="text-primary shrink-0" />
                        {label}
                      </div>
                      <p className="text-[16px] md:text-[17px] leading-[1.35] text-[#2b3045]">{value}</p>
                    </article>
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        </div>

        <section className="pt-10 pb-10 md:pt-12 md:pb-12">
          <div className="container">
            <h3 className="mb-5 text-center text-[20px] md:text-[22px] text-[#0b1035]">
              {relatedLinks.heading}
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <ActionLinkButton
                href={relatedLinks.items[0].href}
                label={relatedLinks.items[0].label}
                icon="download"
                external
                iconBefore
                buttonVariant="outlineMuted"
              />
              <ActionLinkButton
                href={relatedLinks.items[1].href}
                label={relatedLinks.items[1].label}
                icon="chartLine"
                iconBefore
                buttonVariant="outlineMuted"
              />
              <ActionLinkButton
                href={relatedLinks.items[2].href}
                label={relatedLinks.items[2].label}
                icon="trendingUp"
                iconBefore
                buttonVariant="outlineMuted"
              />
            </div>
          </div>
        </section>
    </main>
  )
}
