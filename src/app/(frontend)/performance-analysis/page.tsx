import { SiteShell } from '../_components/SiteShell'
import { getCMSPageBySlug } from '../_components/getCMSPageBySlug'
import { CMSPageContent } from '../_components/CMSPageContent'
import { PerformanceChart } from './PerformanceChart'

const chfDetails = {
  nav: 'CHF 93.29',
  perfYTD: '-0.89%',
  perfMTD: '-0.89%',
  asOf: '31.01.2026',
  sharpe: '0.06',
  absoluteOneYear: '**',
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

const usdDetails = {
  nav: 'USD 192.91',
  perfYTD: '-0.42%',
  perfMTD: '-0.42%',
  asOf: '31.01.2026',
  sharpe: '0.06',
  absoluteOneYear: '**',
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

function ShareClassSection({
  label,
  data,
}: {
  label: string
  data: typeof chfDetails
}) {
  return (
    <div className="space-y-8">
      {/* NAV */}
      <div className="bg-white rounded-xl border border-[#d9def0] p-6">
        <h3 className="text-[14px] uppercase tracking-[0.12em] text-[#5f6477] mb-4">
          NAV Updates {label}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-[36px] font-semibold text-[#0b1035]">{data.nav}</span>
        </div>
        <p className="text-[13px] text-[#5f6477] mt-1">NAV per Share *</p>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-xl border border-[#d9def0] p-6">
        <h3 className="text-[14px] uppercase tracking-[0.12em] text-[#5f6477] mb-4">
          Performance Metrics {label}
        </h3>
        <p className="text-[13px] text-[#5f6477] mb-4">* per {data.asOf}</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[28px] font-semibold text-[#0b1035]">{data.perfYTD}</p>
            <p className="text-[13px] text-[#5f6477]">Performance YTD *</p>
          </div>
          <div>
            <p className="text-[28px] font-semibold text-[#0b1035]">{data.perfMTD}</p>
            <p className="text-[13px] text-[#5f6477]">Performance MTD *</p>
          </div>
        </div>
      </div>

      {/* Risk Metrics */}
      <div className="bg-white rounded-xl border border-[#d9def0] p-6">
        <h3 className="text-[14px] uppercase tracking-[0.12em] text-[#5f6477] mb-4">
          Risk Metrics {label}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[28px] font-semibold text-[#0b1035]">{data.sharpe}</p>
            <p className="text-[13px] text-[#5f6477]">Sharpe Ratio **</p>
          </div>
          <div>
            <p className="text-[28px] font-semibold text-[#0b1035]">{data.absoluteOneYear}</p>
            <p className="text-[13px] text-[#5f6477]">Absolute (1 Year)</p>
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

      {/* Fund Details */}
      <div className="bg-white rounded-xl border border-[#d9def0] p-6">
        <h3 className="text-[14px] uppercase tracking-[0.12em] text-[#5f6477] mb-4">
          Fund Details {label}
        </h3>
        <div className="divide-y divide-[#d9def0]">
          {data.fundDetails.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-3">
              <span className="text-[14px] text-[#5f6477]">{k}</span>
              <span className="text-[14px] font-medium text-[#0b1035] text-right">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default async function PerformancePage() {
  const cmsPage = await getCMSPageBySlug('performance-analysis')
  if (cmsPage) {
    return <CMSPageContent page={cmsPage as never} />
  }

  return (
    <SiteShell>
      <main className="bg-white text-[#0b1035]">
        {/* Hero */}
        <section className="bg-[#2b3dea] pt-32 pb-16 md:pt-40 md:pb-20">
          <div className="container">
            <h1 className="text-white text-[38px] md:text-[48px] leading-[1.12] tracking-tight max-w-3xl">
              Delivering Results Over the Long Term
            </h1>
            <div className="flex gap-4 mt-6">
              <span className="text-white/60 text-[15px]">CHF Hedged Share Class</span>
              <span className="text-white/40">|</span>
              <span className="text-white/60 text-[15px]">USD Share Class</span>
            </div>
          </div>
        </section>

        {/* Downloads */}
        <div className="container py-8">
          <div className="flex flex-wrap gap-3">
            <a
              className="px-5 py-2.5 rounded bg-[#0040ff] text-white text-[13px] uppercase tracking-[0.12em] font-medium"
              href="https://www.vpbank.com/de/vpfundsolutions/fondsinformationen/fondsdokumentationen"
              rel="noreferrer"
              target="_blank"
            >
              Full Performance History
            </a>
            <a
              className="px-5 py-2.5 rounded border border-[#d9def0] text-[13px] uppercase tracking-[0.12em] font-medium text-[#0b1035] hover:bg-[#f5f7ff]"
              href="/impgmt-clone/www.impgmtfund.com/_files/ugd/037a25_e3e73c35d566433fa958a54696b69633.pdf"
              target="_blank"
            >
              Factsheet USD
            </a>
            <a
              className="px-5 py-2.5 rounded border border-[#d9def0] text-[13px] uppercase tracking-[0.12em] font-medium text-[#0b1035] hover:bg-[#f5f7ff]"
              href="/impgmt-clone/www.impgmtfund.com/_files/ugd/037a25_671093d7123f482e9e90bf53264f0f85.pdf"
              target="_blank"
            >
              Factsheet CHF Hedged
            </a>
            <a
              className="px-5 py-2.5 rounded border border-[#d9def0] text-[13px] uppercase tracking-[0.12em] font-medium text-[#0b1035] hover:bg-[#f5f7ff]"
              href="https://www.vpbank.com/de/vpfundsolutions/fondsinformationen/fondsdokumentationen"
              rel="noreferrer"
              target="_blank"
            >
              Latest Fund Commentary
            </a>
          </div>
        </div>

        {/* Performance graphs */}
        <section className="container pb-8">
          <h2 className="text-[22px] leading-[1.3] text-[#0b1035] mb-6">
            Annual Performance Graph (2016–2025)
          </h2>
          <PerformanceChart />
        </section>

        {/* Share Class Details */}
        <div className="container pb-16 md:pb-20">
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-[26px] leading-[1.2] text-[#0b1035] mb-6">CHF Hedged Share Class</h2>
              <ShareClassSection label="CHF Hedged Share Class" data={chfDetails} />
            </div>
            <div>
              <h2 className="text-[26px] leading-[1.2] text-[#0b1035] mb-6">USD Share Class</h2>
              <ShareClassSection label="USD Share Class" data={usdDetails} />
            </div>
          </div>
        </div>

        {/* Regulatory footnotes */}
        <section className="bg-[#f5f7ff] py-10">
          <div className="container text-[13px] text-[#5f6477] space-y-2">
            <p>* Net of all fees. Past performance is not indicative of future results.</p>
            <p>** Based on annualized data where applicable.</p>
          </div>
        </section>
      </main>
    </SiteShell>
  )
}
