import type { Metadata } from 'next'
import {
  getCMSFundDetails,
  getCMSFundIntroQuotes,
  getCMSFundPageData,
  getCMSFundShareClassMeta,
  getCMSHeroCopyBySlug,
  getCMSPageBySlug,
} from '@/app/(frontend)/_components/getCMSPageBySlug'
import { FundShareClassesSection } from '@/app/(frontend)/_components/FundShareClassesSection'
import { PageHero } from '@/app/(frontend)/_components/PageHero'
import { QuoteBandSection } from '@/app/(frontend)/_components/QuoteBandSection'
import { RelatedLinksStrip } from '@/app/(frontend)/_components/RelatedLinksStrip'
import fundContent from '@/constants/fund-content.json'
import fallbacks from '@/constants/fallbacks.json'
import { generateMeta, generateStaticFallbackMeta } from '@/utilities/generateMeta'

export async function generateMetadata(): Promise<Metadata> {
  const cmsPage = await getCMSPageBySlug('fund')
  if (cmsPage) return generateMeta({ doc: cmsPage })

  return generateStaticFallbackMeta('/fund', fallbacks.metadata.fund)
}

const fallbackDetails: Array<{ label: string; value: string; icon: string }> = fallbacks.fund
  .details as Array<{ label: string; value: string; icon: string }>

type ShareClassContent = {
  title: string
  feeLabel: string
  feeText: string
  isin: string
  wkn: string
  bloomberg: string
}

export default async function FundPage() {
  const [cmsHeroCopy, introQuotes, shareClassMeta, cmsDetails, fundPageData] = await Promise.all([
    getCMSHeroCopyBySlug('fund'),
    getCMSFundIntroQuotes('fund'),
    getCMSFundShareClassMeta(),
    getCMSFundDetails(),
    getCMSFundPageData(),
  ])
  const heroTitle = cmsHeroCopy?.title ?? fallbacks.ui.blankHeroTitle
  const heroSubtitle = cmsHeroCopy?.subtitle

  const usdFallback: ShareClassContent = fallbacks.fund.shareClass.usd
  const chfFallback: ShareClassContent = fallbacks.fund.shareClass.chf

  const usdContent = usdFallback
  const chfContent = chfFallback
  const details = cmsDetails?.length ? cmsDetails : fallbackDetails
  const fallbackRelatedLinks = fallbacks.fund.relatedLinks
  const relatedLinks = {
    heading: fundPageData?.relatedLinksHeading || fundContent.relatedLinks.heading || fallbackRelatedLinks.heading,
    items: [
      {
        href:
          fundPageData?.primaryHref ||
          fundContent.relatedLinks.items[0]?.href ||
          fallbackRelatedLinks.items[0]?.href ||
          '#',
        label:
          fundPageData?.primaryLabel ||
          fundContent.relatedLinks.items[0]?.label ||
          fallbackRelatedLinks.items[0]?.label ||
          '',
      },
      {
        href:
          fundPageData?.secondaryHref ||
          fundContent.relatedLinks.items[1]?.href ||
          fallbackRelatedLinks.items[1]?.href ||
          '/performance-analysis',
        label:
          fundPageData?.secondaryLabel ||
          fundContent.relatedLinks.items[1]?.label ||
          fallbackRelatedLinks.items[1]?.label ||
          '',
      },
      {
        href:
          fundPageData?.tertiaryHref ||
          fundContent.relatedLinks.items[2]?.href ||
          fallbackRelatedLinks.items[2]?.href ||
          '/legal-information',
        label:
          fundPageData?.tertiaryLabel ||
          fundContent.relatedLinks.items[2]?.label ||
          fallbackRelatedLinks.items[2]?.label ||
          '',
      },
    ],
  }
  const investmentObjectiveHeading =
    fundPageData?.investmentObjectiveHeading || fundContent.investmentObjective.heading
  const investmentObjectiveBody = fundPageData?.investmentObjectiveBody || fundContent.investmentObjective.body
  const firstDetailsRow = details.slice(0, Math.min(3, details.length))
  const secondDetailsRow = details.slice(firstDetailsRow.length)
  const isExternalLink = (href: string): boolean => href.startsWith('http://') || href.startsWith('https://')

  return (
    <main className="bg-white text-[#0b1035] overflow-x-clip">
        <PageHero
          title={heroTitle}
          subtitle={heroSubtitle}
          palette={{ color1: '#2b3dea', color2: 'oklch(0.45 0.12 58)', color3: 'oklch(0.45 0.11 20)' }}
          subtitleClassName="text-white text-[19px] md:text-[21px] max-w-lg font-light"
          sectionClassName="relative overflow-hidden"
        />

        <QuoteBandSection quotes={[introQuotes?.first || '', introQuotes?.second || '']} />

        <section className="container pt-16 md:pt-20 pb-0 text-center">
            <h2 className="text-[13px] md:text-[14px] uppercase tracking-[0.12em] text-primary font-light mb-4">
              {investmentObjectiveHeading}
            </h2>
            <p className="text-[22px] md:text-[28px] text-[#2b3045] leading-[1.35] italic">
              {investmentObjectiveBody}
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
          <section className="relative">
            <div className="w-full border-l border-t border-[#d9def0]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
                {firstDetailsRow.map(({ label, value }) => (
                  <article
                    key={label}
                    className="border-r border-b border-[#d9def0] p-4 md:p-5 min-h-[110px] md:min-h-[120px]"
                  >
                    <div className="font-display inline-flex items-center gap-2 text-[13px] md:text-[14px] uppercase tracking-[0.12em] text-primary font-medium mb-2">
                      {label}
                    </div>
                    <p className="text-[16px] md:text-[17px] leading-[1.35] text-[#2b3045]">{value}</p>
                  </article>
                ))}
              </div>
              {secondDetailsRow.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-0">
                  {secondDetailsRow.map(({ label, value }) => (
                    <article
                      key={label}
                      className="border-r border-b border-[#d9def0] p-4 md:p-5 min-h-[110px] md:min-h-[120px]"
                    >
                      <div className="font-display inline-flex items-center gap-2 text-[13px] md:text-[14px] uppercase tracking-[0.12em] text-primary font-medium mb-2">
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

        <RelatedLinksStrip
          heading={relatedLinks.heading}
          items={[
            {
              href: relatedLinks.items[0].href,
              label: relatedLinks.items[0].label,
              icon: 'download',
              external: isExternalLink(relatedLinks.items[0].href),
              iconBefore: true,
            },
            {
              href: relatedLinks.items[1].href,
              label: relatedLinks.items[1].label,
              icon: 'chartLine',
              external: isExternalLink(relatedLinks.items[1].href),
              iconBefore: true,
            },
            {
              href: relatedLinks.items[2].href,
              label: relatedLinks.items[2].label,
              icon: 'trendingUp',
              external: isExternalLink(relatedLinks.items[2].href),
              iconBefore: true,
            },
          ]}
        />
    </main>
  )
}
