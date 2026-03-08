import type { Metadata } from 'next'
import {
  getCMSPageBySlug,
  getCMSPerformanceNavSeries,
  getCMSPerformancePageData,
} from '../_components/getCMSPageBySlug'
import { getHomeCMSContent } from '../_components/getHomeCMSContent'
import { PageHero } from '../_components/PageHero'
import { ActionLinkButton } from '../_components/ActionLinkButton'
import { PerformanceChart } from './PerformanceChart'
import fallbacks from '@/constants/fallbacks.json'
import performanceContent from '@/constants/performance-analysis-content.json'
import { generateMeta } from '@/utilities/generateMeta'

export async function generateMetadata(): Promise<Metadata> {
  const cmsPage = await getCMSPageBySlug('performance-analysis')
  if (cmsPage) return generateMeta({ doc: cmsPage })

  return fallbacks.metadata.performanceAnalysis
}

const chfFallbackDetails = {
  ...fallbacks.performance.shareClassDetails.chf,
  fundDetails: fallbacks.performance.shareClassDetails.chf.fundDetails as Array<[string, string]>,
}

const usdFallbackDetails = {
  ...fallbacks.performance.shareClassDetails.usd,
  fundDetails: fallbacks.performance.shareClassDetails.usd.fundDetails as Array<[string, string]>,
}

type ShareClassDetails = typeof chfFallbackDetails

function mergeShareClassDetails(
  fallback: ShareClassDetails,
  cms: {
    nav?: string
    perfYTD?: string
    asOf?: string
    sharpe?: string
    volatility?: string
    sortino?: string
    downsideRisk?: string
    fundDetails?: Array<[string, string]>
  } | null | undefined,
): ShareClassDetails {
  return {
    nav: cms?.nav || fallback.nav,
    perfYTD: cms?.perfYTD || fallback.perfYTD,
    asOf: cms?.asOf || fallback.asOf,
    sharpe: cms?.sharpe || fallback.sharpe,
    volatility: cms?.volatility || fallback.volatility,
    sortino: cms?.sortino || fallback.sortino,
    downsideRisk: cms?.downsideRisk || fallback.downsideRisk,
    fundDetails: cms?.fundDetails?.length ? cms.fundDetails : fallback.fundDetails,
  }
}

function NavUpdatesCard({ data }: { data: ShareClassDetails }) {
  return (
    <div className="font-display">
      <h3 className="text-[14px] uppercase tracking-[0.12em] text-[#5f6477] mb-4">
        {performanceContent.cards.navUpdatesTitle}
      </h3>
      <div className="flex items-baseline gap-2">
        <span className="text-[36px] font-semibold text-[#0b1035]">{data.nav}</span>
      </div>
      <p className="text-[13px] text-[#5f6477] mt-1">
        {performanceContent.cards.navPerShareLabel} <span className="text-[#0040ff]">*</span>
      </p>
    </div>
  )
}

function PerformanceMetricsCard({ data }: { data: ShareClassDetails }) {
  return (
    <div className="font-display">
      <div className="mb-4 h-px w-full bg-[#d9def0]" />
      <h3 className="text-[14px] uppercase tracking-[0.12em] text-[#5f6477] mb-4">
        {performanceContent.cards.performanceMetricsTitle}
      </h3>
      <p className="text-[13px] text-[#5f6477] mb-4">
        <span className="text-[#0040ff]">*</span> {performanceContent.cards.asOfPrefix} {data.asOf}
      </p>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <p className="text-[28px] font-semibold text-[#0b1035]">{data.perfYTD}</p>
          <p className="text-[13px] text-[#5f6477]">
            {performanceContent.cards.performanceYtdLabel} <span className="text-[#0040ff]">*</span>
          </p>
        </div>
      </div>
    </div>
  )
}

function RiskMetricsCard({ data }: { data: ShareClassDetails }) {
  return (
    <div className="font-display">
      <div className="mb-4 h-px w-full bg-[#d9def0]" />
      <h3 className="text-[14px] uppercase tracking-[0.12em] text-[#5f6477] mb-4">
        {performanceContent.cards.riskMetricsTitle}
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[28px] font-semibold text-[#0b1035]">{data.sharpe}</p>
          <p className="text-[13px] text-[#5f6477]">
            {performanceContent.cards.sharpeRatioLabel} <span className="text-[#0040ff]">**</span>
          </p>
        </div>
        <div>
          <p className="text-[28px] font-semibold text-[#0b1035]">{data.volatility}</p>
          <p className="text-[13px] text-[#5f6477]">
            {performanceContent.cards.volatilityLabel} <span className="text-[#0040ff]">**</span>
          </p>
        </div>
        <div>
          <p className="text-[28px] font-semibold text-[#0b1035]">{data.sortino}</p>
          <p className="text-[13px] text-[#5f6477]">
            {performanceContent.cards.sortinoRatioLabel} <span className="text-[#0040ff]">**</span>
          </p>
        </div>
        <div>
          <p className="text-[28px] font-semibold text-[#0b1035]">{data.downsideRisk}</p>
          <p className="text-[13px] text-[#5f6477]">
            {performanceContent.cards.downsideRiskLabel} <span className="text-[#0040ff]">**</span>
          </p>
        </div>
      </div>
    </div>
  )
}

function FundDetailsCard({ data }: { data: ShareClassDetails }) {
  return (
    <div className="border-t border-[#d9def0] pt-4 font-display">
      <h3 className="text-[14px] uppercase tracking-[0.12em] text-[#5f6477] mb-4">
        {performanceContent.cards.fundDetailsTitle}
      </h3>
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
  const [cmsPerformanceSeries, cmsPerformanceData, homeCms] = await Promise.all([
    getCMSPerformanceNavSeries(),
    getCMSPerformancePageData(),
    getHomeCMSContent(),
  ])
  const factsheetUSD =
    homeCms.downloads.find((item) => item.id === 'factsheetUsd')?.href || fallbacks.ui.emptyText
  const factsheetCHF =
    homeCms.downloads.find((item) => item.id === 'factsheetChfHedged')?.href || fallbacks.ui.emptyText
  const fundCommentary =
    homeCms.downloads.find((item) => item.id === 'fundCommentary')?.href || fallbacks.ui.emptyText

  const chfDetails = mergeShareClassDetails(chfFallbackDetails, cmsPerformanceData?.chf)
  const usdDetails = mergeShareClassDetails(usdFallbackDetails, cmsPerformanceData?.usd)
  const chfTitle = cmsPerformanceData?.chfLabel || fallbacks.performance.labels.chfTitle
  const usdTitle = cmsPerformanceData?.usdLabel || fallbacks.performance.labels.usdTitle
  const performanceTitle = cmsPerformanceData?.annualPerformanceTitle || performanceContent.chart.title
  const heroTitle = cmsPerformanceData?.pageTitle || fallbacks.performance.labels.heroTitle

  return (
    <main className="bg-white text-[#0b1035]">
        <PageHero
          title={heroTitle}
          palette={{ color1: '#2b3dea', color2: 'oklch(0.46 0.14 330)', color3: 'oklch(0.46 0.12 280)' }}
        >
          <span
            className="mt-6 block whitespace-nowrap text-white text-[19px] md:text-[21px] leading-[1.6]"
            data-transition-force="true"
          >
            {chfTitle} &amp; {usdTitle}
          </span>
        </PageHero>

        {/* Performance graphs */}
        <section className="pt-8 md:pt-10 pb-8">
          <div className="container">
            <h2 className="mb-6 flex flex-wrap items-center gap-2 text-[22px] leading-[1.3] text-[#0b1035]">
              <span>{performanceTitle}</span>
              <span className="inline-flex items-center border border-[#d9def0] bg-white px-2.5 py-1 text-[12px] text-[#2b3045]">
                {performanceContent.chart.yearBadge}
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
              className="pointer-events-none absolute -top-8 left-1/2 h-px w-screen -translate-x-1/2 bg-[#d9def0]"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-0 left-1/2 h-px w-screen -translate-x-1/2 bg-[#d9def0]"
            />
            <span aria-hidden className="pointer-events-none absolute left-1/2 -top-8 bottom-0 hidden w-px -translate-x-1/2 bg-[#d9def0] lg:block" />
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
              <div className="space-y-8 pt-4 lg:pt-6 lg:pr-8">
                <img src="/images/flags/ch.svg" alt="Swiss flag" className="h-5 w-auto" loading="lazy" />
                <h2 className="text-[26px] leading-[1.2] text-[#0b1035]">{chfTitle}</h2>
                <NavUpdatesCard data={chfDetails} />
                <PerformanceMetricsCard data={chfDetails} />
                <RiskMetricsCard data={chfDetails} />
                <FundDetailsCard data={chfDetails} />
              </div>
              <div className="space-y-8 pt-4 lg:pt-6 lg:pl-8">
                <div className="-mx-4 h-px w-[calc(100%+2rem)] bg-[#d9def0] lg:hidden" />
                <img src="/images/flags/us.svg" alt="United States flag" className="h-5 w-auto" loading="lazy" />
                <h2 className="text-[26px] leading-[1.2] text-[#0b1035]">{usdTitle}</h2>
                <NavUpdatesCard data={usdDetails} />
                <PerformanceMetricsCard data={usdDetails} />
                <RiskMetricsCard data={usdDetails} />
                <FundDetailsCard data={usdDetails} />
              </div>
            </div>
          </div>
        </div>

        {/* Regulatory footnotes */}
        <section className="bg-white py-10">
          <div className="container text-[13px] text-[#5f6477] space-y-2">
            <p>
              <span className="text-[#0040ff]">*</span> {performanceContent.footnotes.singleAsterisk}
            </p>
            <p>
              <span className="text-[#0040ff]">**</span> {performanceContent.footnotes.doubleAsterisk}
            </p>
          </div>
        </section>

        <section className="border-t border-[#d9def0] pt-10 pb-10 md:pt-12 md:pb-12">
          <div className="container">
            <h3 className="mb-5 text-center text-[20px] md:text-[22px] text-[#0b1035]">
              {performanceContent.relatedLinks.heading}
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <ActionLinkButton
                href={performanceContent.relatedLinks.fullHistory.href}
                label={performanceContent.relatedLinks.fullHistory.label}
                icon="chartLine"
                external
                iconBefore
                buttonVariant="outlineMuted"
              />
              {factsheetUSD ? (
                <ActionLinkButton
                  href={factsheetUSD}
                  label={performanceContent.relatedLinks.factsheetUsdLabel}
                  icon="download"
                  external
                  iconBefore
                  buttonVariant="outlineMuted"
                />
              ) : null}
              {factsheetCHF ? (
                <ActionLinkButton
                  href={factsheetCHF}
                  label={performanceContent.relatedLinks.factsheetChfLabel}
                  icon="download"
                  external
                  iconBefore
                  buttonVariant="outlineMuted"
                />
              ) : null}
              {fundCommentary ? (
                <ActionLinkButton
                  href={fundCommentary}
                  label={performanceContent.relatedLinks.fundCommentaryLabel}
                  icon="trendingUp"
                  external
                  iconBefore
                  buttonVariant="outlineMuted"
                />
              ) : null}
            </div>
          </div>
        </section>
    </main>
  )
}
