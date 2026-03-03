import {
  getCMSPageBySlug,
  getCMSPerformanceNavSeries,
  getCMSPerformancePageData,
} from '../_components/getCMSPageBySlug'
import { CMSPageContent } from '../_components/CMSPageContent'
import { PageHero, PageHeroMeta } from '../_components/PageHero'
import { ActionLinkButton } from '../_components/ActionLinkButton'
import { PerformanceChart } from './PerformanceChart'

const chfFallbackDetails = {
  nav: 'CHF 93.29',
  perfYTD: '-0.89%',
  asOf: '31.01.2026',
  sharpe: '0.06',
  volatility: '19.75',
  sortino: '0.09',
  downsideRisk: '14.16',
  fundDetails: [
    ['Liquidity', 'Daily'],
    ['Trade Day', 'Banking Day'],
    ['Settlement', 'T+3'],
    ['Cut-off Subscription & Redemption (Trade Day)', '12:00'],
    ['All-In Fee', 'up to 1.27%'],
    ['Management Fee', '0.50%'],
    ['Administrative Fees', 'up to 0.77%'],
    ['Performance Fee', '10.00% / High-Water Mark'],
    ['Crystallization Freq.', 'Quarterly'],
    ['Subscription Fee', '0.00%'],
    ['Redemption Fee', '2.00%'],
    ['Inception Date', '07.10.2025'],
    ['Fund Currency', 'CHF'],
    ['Inception Price', 'CHF 100.00'],
    ['Min. Investment', '1.00 Share'],
  ],
}

const usdFallbackDetails = {
  nav: 'USD 192.91',
  perfYTD: '-0.42%',
  asOf: '31.01.2026',
  sharpe: '0.06',
  volatility: '19.75',
  sortino: '0.09',
  downsideRisk: '14.16',
  fundDetails: [
    ['Liquidity', 'Daily'],
    ['Trade Day', 'Banking Day'],
    ['Settlement', 'T+3'],
    ['Cut-off Subscription & Redemption (Trade Day)', '12:00'],
    ['All-In Fee', 'up to 1.50%'],
    ['Management Fee', '1.00%'],
    ['Administrative Fees', 'up to 0.50%'],
    ['Performance Fee', '10.00% / High-Water Mark'],
    ['Crystallization Freq.', 'Quarterly'],
    ['Subscription Fee', '1.00%'],
    ['Redemption Fee', '2.00%'],
    ['Inception Date', '06.09.2016'],
    ['Fund Currency', 'USD'],
    ['Inception Price', 'USD 100.00'],
    ['Min. Investment', '1.00 Share'],
  ],
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
      <h3 className="text-[14px] uppercase tracking-[0.12em] text-[#5f6477] mb-4">NAV Updates</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-[36px] font-semibold text-[#0b1035]">{data.nav}</span>
      </div>
      <p className="text-[13px] text-[#5f6477] mt-1">NAV per Share *</p>
    </div>
  )
}

function PerformanceMetricsCard({ data }: { data: ShareClassDetails }) {
  return (
    <div className="font-display">
      <h3 className="text-[14px] uppercase tracking-[0.12em] text-[#5f6477] mb-4">Performance Metrics</h3>
      <p className="text-[13px] text-[#5f6477] mb-4">* per {data.asOf}</p>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <p className="text-[28px] font-semibold text-[#0b1035]">{data.perfYTD}</p>
          <p className="text-[13px] text-[#5f6477]">Performance YTD *</p>
        </div>
      </div>
    </div>
  )
}

function RiskMetricsCard({ data }: { data: ShareClassDetails }) {
  return (
    <div className="font-display">
      <h3 className="text-[14px] uppercase tracking-[0.12em] text-[#5f6477] mb-4">Risk Metrics</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[28px] font-semibold text-[#0b1035]">{data.sharpe}</p>
          <p className="text-[13px] text-[#5f6477]">Sharpe Ratio **</p>
        </div>
        <div>
          <p className="text-[28px] font-semibold text-[#0b1035]">{data.volatility}</p>
          <p className="text-[13px] text-[#5f6477]">Volatility **</p>
        </div>
        <div>
          <p className="text-[28px] font-semibold text-[#0b1035]">{data.sortino}</p>
          <p className="text-[13px] text-[#5f6477]">Sortino Ratio **</p>
        </div>
        <div>
          <p className="text-[28px] font-semibold text-[#0b1035]">{data.downsideRisk}</p>
          <p className="text-[13px] text-[#5f6477]">Downside Risk **</p>
        </div>
      </div>
    </div>
  )
}

function FundDetailsCard({ data }: { data: ShareClassDetails }) {
  return (
    <div className="h-full font-display">
      <h3 className="text-[14px] uppercase tracking-[0.12em] text-[#5f6477] mb-4">Fund Details</h3>
      <div className="divide-y divide-[#d9def0]">
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
  const [cmsPage, cmsPerformanceSeries, cmsPerformanceData] = await Promise.all([
    getCMSPageBySlug('performance-analysis'),
    getCMSPerformanceNavSeries(),
    getCMSPerformancePageData(),
  ])
  if (cmsPage) {
    return <CMSPageContent page={cmsPage as never} />
  }

  const chfDetails = mergeShareClassDetails(chfFallbackDetails, cmsPerformanceData?.chf)
  const usdDetails = mergeShareClassDetails(usdFallbackDetails, cmsPerformanceData?.usd)
  const chfTitle = cmsPerformanceData?.chfLabel || 'CHF Hedged Share Class'
  const usdTitle = cmsPerformanceData?.usdLabel || 'USD Share Class'
  const performanceTitle = cmsPerformanceData?.annualPerformanceTitle || 'Annual Performance Graph (2016–2025)'
  const heroTitle = cmsPerformanceData?.pageTitle || 'Delivering Results Over the Long Term'

  return (
    <main className="bg-white text-[#0b1035]">
        <PageHero
          title={heroTitle}
          palette={{ color1: 'oklch(0.46 0.16 306)', color2: 'oklch(0.46 0.14 330)', color3: 'oklch(0.46 0.12 280)' }}
        >
          <PageHeroMeta items={[chfTitle, usdTitle]} />
        </PageHero>

        {/* Performance graphs */}
        <section className="container pt-8 md:pt-10 pb-8">
          <h2 className="text-[22px] leading-[1.3] text-[#0b1035] mb-6">{performanceTitle}</h2>
          <PerformanceChart
            usdSeries={cmsPerformanceSeries.usd}
            chfSeries={cmsPerformanceSeries.chf}
          />
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
                <h2 className="text-[26px] leading-[1.2] text-[#0b1035]">{chfTitle}</h2>
                <NavUpdatesCard data={chfDetails} />
                <PerformanceMetricsCard data={chfDetails} />
                <RiskMetricsCard data={chfDetails} />
                <FundDetailsCard data={chfDetails} />
              </div>
              <div className="space-y-8 pt-4 lg:pt-6 lg:pl-8">
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
            <p>* Net of all fees. Past performance is not indicative of future results.</p>
            <p>** Based on annualized data where applicable.</p>
          </div>
        </section>

        <section className="border-t border-[#d9def0] pt-10 pb-10 md:pt-12 md:pb-12">
          <div className="container">
            <h3 className="mb-5 text-center text-[20px] md:text-[22px] text-[#0b1035]">Related Links</h3>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <ActionLinkButton
                href="https://www.vpbank.com/de/vpfundsolutions/fondsinformationen/fondsdokumentationen"
                label="Full Performance History"
                icon="chartLine"
                external
                iconBefore
                buttonVariant="outlineMuted"
              />
              <ActionLinkButton
                href="/impgmt-clone/www.impgmtfund.com/_files/ugd/037a25_e3e73c35d566433fa958a54696b69633.pdf"
                label="Factsheet USD"
                icon="download"
                external
                iconBefore
                buttonVariant="outlineMuted"
              />
              <ActionLinkButton
                href="/impgmt-clone/www.impgmtfund.com/_files/ugd/037a25_671093d7123f482e9e90bf53264f0f85.pdf"
                label="Factsheet CHF Hedged"
                icon="download"
                external
                iconBefore
                buttonVariant="outlineMuted"
              />
              <ActionLinkButton
                href="https://www.vpbank.com/de/vpfundsolutions/fondsinformationen/fondsdokumentationen"
                label="Latest Fund Commentary"
                icon="trendingUp"
                external
                iconBefore
                buttonVariant="outlineMuted"
              />
            </div>
          </div>
        </section>
    </main>
  )
}
