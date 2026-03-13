import type { Metadata } from 'next'
import {
  getCMSPageBySlug,
  getCMSPerformanceNavSeries,
  getCMSPerformancePageData,
  getCMSPerformanceShareClassCards,
} from '@/app/(frontend)/_components/getCMSPageBySlug'
import { CMSPageHero } from '@/app/(frontend)/_components/CMSPageHero'
import { RelatedLinksStrip } from '@/app/(frontend)/_components/RelatedLinksStrip'
import { PerformanceChart } from '@/app/(frontend)/performance-analysis/PerformanceChart'
import fallbacks from '@/constants/fallbacks.json'
import performanceContent from '@/constants/performance-analysis-content.json'
import { generateMeta, generateStaticFallbackMeta } from '@/utilities/generateMeta'

export async function generateMetadata(): Promise<Metadata> {
  const cmsPage = await getCMSPageBySlug('performance-analysis')
  if (cmsPage) return generateMeta({ doc: cmsPage })

  return generateStaticFallbackMeta('/performance-analysis', fallbacks.metadata.performanceAnalysis)
}

type ShareClassDetails = {
  nav: string
  perfYTD: string
  asOf: string
  sharpe: string
  volatility: string
  sortino: string
  downsideRisk: string
  fundDetails: Array<[string, string]>
}

type PerformanceCardLabels = {
  navUpdatesTitle: string
  navPerShareLabel: string
  performanceMetricsTitle: string
  asOfPrefix: string
  performanceYtdLabel: string
  riskMetricsTitle: string
  sharpeRatioLabel: string
  volatilityLabel: string
  sortinoRatioLabel: string
  downsideRiskLabel: string
  fundDetailsTitle: string
}

function NavUpdatesCard({ data, labels }: { data: ShareClassDetails; labels: PerformanceCardLabels }) {
  return (
    <div className="font-display">
      <h3 className="text-[14px] uppercase tracking-[0.12em] text-[#5f6477] mb-4">{labels.navUpdatesTitle}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-[36px] font-semibold text-[#0b1035]">{data.nav}</span>
      </div>
      <p className="text-[13px] text-[#5f6477] mt-1">
        {labels.navPerShareLabel} <span className="text-[#0040ff]">*</span>
      </p>
    </div>
  )
}

function PerformanceMetricsCard({ data, labels }: { data: ShareClassDetails; labels: PerformanceCardLabels }) {
  return (
    <div className="font-display">
      <div className="mb-4 h-px w-full bg-[#d9def0]" />
      <h3 className="text-[14px] uppercase tracking-[0.12em] text-[#5f6477] mb-4">{labels.performanceMetricsTitle}</h3>
      <p className="text-[13px] text-[#5f6477] mb-4">
        <span className="text-[#0040ff]">*</span> {labels.asOfPrefix} {data.asOf}
      </p>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <p className="text-[28px] font-semibold text-[#0b1035]">{data.perfYTD}</p>
          <p className="text-[13px] text-[#5f6477]">
            {labels.performanceYtdLabel} <span className="text-[#0040ff]">*</span>
          </p>
        </div>
      </div>
    </div>
  )
}

function RiskMetricsCard({ data, labels }: { data: ShareClassDetails; labels: PerformanceCardLabels }) {
  return (
    <div className="font-display">
      <div className="mb-4 h-px w-full bg-[#d9def0]" />
      <h3 className="text-[14px] uppercase tracking-[0.12em] text-[#5f6477] mb-4">{labels.riskMetricsTitle}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[28px] font-semibold text-[#0b1035]">{data.sharpe}</p>
          <p className="text-[13px] text-[#5f6477]">
            {labels.sharpeRatioLabel} <span className="text-[#0040ff]">**</span>
          </p>
        </div>
        <div>
          <p className="text-[28px] font-semibold text-[#0b1035]">{data.volatility}</p>
          <p className="text-[13px] text-[#5f6477]">
            {labels.volatilityLabel} <span className="text-[#0040ff]">**</span>
          </p>
        </div>
        <div>
          <p className="text-[28px] font-semibold text-[#0b1035]">{data.sortino}</p>
          <p className="text-[13px] text-[#5f6477]">
            {labels.sortinoRatioLabel} <span className="text-[#0040ff]">**</span>
          </p>
        </div>
        <div>
          <p className="text-[28px] font-semibold text-[#0b1035]">{data.downsideRisk}</p>
          <p className="text-[13px] text-[#5f6477]">
            {labels.downsideRiskLabel} <span className="text-[#0040ff]">**</span>
          </p>
        </div>
      </div>
    </div>
  )
}

function FundDetailsCard({ data, labels }: { data: ShareClassDetails; labels: PerformanceCardLabels }) {
  return (
    <div className="border-t border-[#d9def0] pt-4 font-display">
      <h3 className="text-[14px] uppercase tracking-[0.12em] text-[#5f6477] mb-4">{labels.fundDetailsTitle}</h3>
      <div className="divide-y divide-[#d9def0] border-b border-[#d9def0]">
        {data.fundDetails.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 py-3">
            <span className="text-[14px] text-[#5f6477]">{k}</span>
            <span className="text-[14px] font-medium text-[#0b1035] text-right">{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function PerformancePage() {
  const [cmsPerformanceSeries, cmsPerformanceData, cmsShareClassCards] = await Promise.all([
    getCMSPerformanceNavSeries(),
    getCMSPerformancePageData(),
    getCMSPerformanceShareClassCards(),
  ])
  const factsheetUSD = cmsPerformanceData?.factsheetUsdHref || fallbacks.ui.emptyText
  const factsheetCHF = cmsPerformanceData?.factsheetChfHref || fallbacks.ui.emptyText
  const fundCommentary = cmsPerformanceData?.fundCommentaryHref || fallbacks.ui.emptyText

  const chfDetails = cmsShareClassCards.chf as ShareClassDetails
  const usdDetails = cmsShareClassCards.usd as ShareClassDetails
  const chfTitle = cmsPerformanceData?.chfLabel || fallbacks.performance.labels.chfTitle
  const usdTitle = cmsPerformanceData?.usdLabel || fallbacks.performance.labels.usdTitle
  const performanceTitle = cmsPerformanceData?.annualPerformanceTitle || performanceContent.chart.title
  const yearBadge = cmsPerformanceData?.chartYearBadge || performanceContent.chart.yearBadge
  const relatedLinksHeading = cmsPerformanceData?.relatedLinksHeading || performanceContent.relatedLinks.heading
  const fullHistoryLabel = cmsPerformanceData?.fullHistoryLabel || performanceContent.relatedLinks.fullHistory.label
  const fullHistoryHref = cmsPerformanceData?.fullHistoryHref || performanceContent.relatedLinks.fullHistory.href
  const factsheetUsdLabel =
    cmsPerformanceData?.factsheetUsdLabel || performanceContent.relatedLinks.factsheetUsdLabel
  const factsheetChfLabel =
    cmsPerformanceData?.factsheetChfLabel || performanceContent.relatedLinks.factsheetChfLabel
  const fundCommentaryLabel =
    cmsPerformanceData?.fundCommentaryLabel || performanceContent.relatedLinks.fundCommentaryLabel
  const singleAsteriskFootnote =
    cmsPerformanceData?.footnoteSingleAsterisk || performanceContent.footnotes.singleAsterisk
  const doubleAsteriskFootnote =
    cmsPerformanceData?.footnoteDoubleAsterisk || performanceContent.footnotes.doubleAsterisk

  const cardLabels: PerformanceCardLabels = {
    navUpdatesTitle: cmsPerformanceData?.navUpdatesTitle || performanceContent.cards.navUpdatesTitle,
    navPerShareLabel: cmsPerformanceData?.navPerShareLabel || performanceContent.cards.navPerShareLabel,
    performanceMetricsTitle:
      cmsPerformanceData?.performanceMetricsTitle || performanceContent.cards.performanceMetricsTitle,
    asOfPrefix: cmsPerformanceData?.asOfPrefix || performanceContent.cards.asOfPrefix,
    performanceYtdLabel: cmsPerformanceData?.performanceYtdLabel || performanceContent.cards.performanceYtdLabel,
    riskMetricsTitle: cmsPerformanceData?.riskMetricsTitle || performanceContent.cards.riskMetricsTitle,
    sharpeRatioLabel: cmsPerformanceData?.sharpeRatioLabel || performanceContent.cards.sharpeRatioLabel,
    volatilityLabel: cmsPerformanceData?.volatilityLabel || performanceContent.cards.volatilityLabel,
    sortinoRatioLabel: cmsPerformanceData?.sortinoRatioLabel || performanceContent.cards.sortinoRatioLabel,
    downsideRiskLabel: cmsPerformanceData?.downsideRiskLabel || performanceContent.cards.downsideRiskLabel,
    fundDetailsTitle: cmsPerformanceData?.fundDetailsTitle || performanceContent.cards.fundDetailsTitle,
  }

  return (
    <main className="bg-white text-[#0b1035]">
        <CMSPageHero
          page={null}
          fallbackTitle={cmsPerformanceData?.pageTitle || fallbacks.performance.labels.heroTitle}
          palette={{ color1: '#2b3dea', color2: 'oklch(0.46 0.14 330)', color3: 'oklch(0.46 0.12 280)' }}
        >
          <span
            className="mt-6 block whitespace-nowrap text-white text-[19px] md:text-[21px] leading-[1.6]"
            data-transition-force="true"
          >
            {usdTitle} &amp; {chfTitle}
          </span>
        </CMSPageHero>

        {/* Performance graphs */}
        <section className="pt-8 md:pt-10 pb-8">
          <div className="container">
            <h2 className="mb-6 flex flex-wrap items-center gap-2 text-[22px] leading-[1.3] text-[#0b1035]">
              <span>{performanceTitle}</span>
              <span className="inline-flex items-center border border-[#d9def0] bg-white px-2.5 py-1 text-[12px] text-[#2b3045]">
                {yearBadge}
              </span>
            </h2>
          </div>
          <div className="w-full">
            <PerformanceChart
              usdSeries={cmsPerformanceSeries.usd}
              chfSeries={cmsPerformanceSeries.chf}
              exportSvgTooltip={cmsPerformanceData?.exportSvgTooltip}
              exportCsvTooltip={cmsPerformanceData?.exportCsvTooltip}
            />
          </div>
        </section>

        {/* Share Class Details */}
        <div className="container">
          <div className="relative">
            <span
              aria-hidden
              className="pointer-events-none absolute -top-8 left-0 right-0 h-px bg-[#d9def0]"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-[#d9def0]"
            />
            <span aria-hidden className="pointer-events-none absolute left-1/2 -top-8 bottom-0 hidden w-px -translate-x-1/2 bg-[#d9def0] lg:block" />
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
              <div className="space-y-8 pt-4 lg:pt-6 lg:pr-8">
                <img src="/images/flags/us.svg" alt="United States flag" className="h-5 w-auto" loading="lazy" />
                <h2 className="text-[26px] leading-[1.2] text-[#0b1035]">{usdTitle}</h2>
                <NavUpdatesCard data={usdDetails} labels={cardLabels} />
                <PerformanceMetricsCard data={usdDetails} labels={cardLabels} />
                <RiskMetricsCard data={usdDetails} labels={cardLabels} />
                <FundDetailsCard data={usdDetails} labels={cardLabels} />
              </div>
              <div className="space-y-8 pt-4 lg:pt-6 lg:pl-8">
                <div className="h-px w-full bg-[#d9def0] lg:hidden" />
                <img src="/images/flags/ch.svg" alt="Swiss flag" className="h-5 w-auto" loading="lazy" />
                <h2 className="text-[26px] leading-[1.2] text-[#0b1035]">{chfTitle}</h2>
                <NavUpdatesCard data={chfDetails} labels={cardLabels} />
                <PerformanceMetricsCard data={chfDetails} labels={cardLabels} />
                <RiskMetricsCard data={chfDetails} labels={cardLabels} />
                <FundDetailsCard data={chfDetails} labels={cardLabels} />
              </div>
            </div>
          </div>
        </div>

        {/* Regulatory footnotes */}
        <section className="bg-white py-10">
          <div className="container text-[13px] text-[#5f6477] italic space-y-2">
            <p>
              <span className="text-[#0040ff]">*</span> {singleAsteriskFootnote}
            </p>
            <p>
              <span className="text-[#0040ff]">**</span> {doubleAsteriskFootnote}
            </p>
          </div>
        </section>

        <RelatedLinksStrip
          borderTop
          heading={relatedLinksHeading}
          items={[
            {
              href: fullHistoryHref,
              label: fullHistoryLabel,
              icon: 'chartLine',
              external: true,
              iconBefore: true,
            },
            ...(factsheetUSD
              ? [
                  {
                    href: factsheetUSD,
                    label: factsheetUsdLabel,
                    icon: 'download' as const,
                    external: true,
                    iconBefore: true,
                  },
                ]
              : []),
            ...(factsheetCHF
              ? [
                  {
                    href: factsheetCHF,
                    label: factsheetChfLabel,
                    icon: 'download' as const,
                    external: true,
                    iconBefore: true,
                  },
                ]
              : []),
            ...(fundCommentary
              ? [
                  {
                    href: fundCommentary,
                    label: fundCommentaryLabel,
                    icon: 'trendingUp' as const,
                    external: true,
                    iconBefore: true,
                  },
                ]
              : []),
          ]}
        />
    </main>
  )
}
