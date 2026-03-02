import { getCMSPageBySlug } from '../_components/getCMSPageBySlug'
import { CMSPageContent } from '../_components/CMSPageContent'
import { PageHero } from '../_components/PageHero'

const details = [
  ['Liquidity', 'Daily and T+3 settlement'],
  ['Asset Classes', 'Global equities, with selective use of funds/ETFs'],
  ['Regulatory Distribution', 'Switzerland'],
  ['Structure & Jurisdiction', 'UCITS · Liechtenstein'],
  [
    'Investment Objective',
    'Focused on above-average, long-term capital appreciation through exposure to transformational megatrends',
  ],
  ['SFDR-Classification', 'Article 6 SFDR'],
]

export default async function FundPage() {
  const cmsPage = await getCMSPageBySlug('fund')
  if (cmsPage) {
    return <CMSPageContent page={cmsPage as never} />
  }

  return (
    <main className="bg-white text-[#0b1035]">
        <PageHero
          title="The IMP Global Megatrend Umbrella Fund"
          subtitle="Investing in the Forces That Shape Tomorrow"
          subtitleClassName="text-white text-[19px] md:text-[21px] max-w-lg"
          sectionClassName="relative overflow-hidden"
        />

        <div className="container py-16 md:py-20 space-y-12">
          <section className="max-w-5xl">
            <blockquote className="border-l-2 border-[#0040ff] pl-5 text-[#2b3045] leading-relaxed text-[16px]">
              &ldquo;Our investment focus lies in six defining megatrends: Technology/Technological
              Advancements, Changing Consumer Behavior/Demographics, Healthcare/Longevity Revolution,
              Shift in Economic Power, Mobility/Transportation, and Smart Infrastructure/Smart City.
              By identifying and investing in companies and sectors aligned with these structural
              changes, we aim to deliver sustainable, above-average long-term returns.&rdquo;
            </blockquote>

            <div className="flex flex-wrap gap-3 mt-7">
              <a
                className="px-5 py-2.5 rounded bg-[#0040ff] text-white text-[13px] uppercase tracking-[0.12em] font-medium"
                href="https://www.vpbank.com/de/vpfundsolutions/fondsinformationen/fondsdokumentationen"
                rel="noreferrer"
                target="_blank"
              >
                Fund documentation
              </a>
              <a
                className="px-5 py-2.5 rounded border border-[#d9def0] text-[13px] uppercase tracking-[0.12em] font-medium text-[#0b1035] hover:bg-[#f5f7ff]"
                href="/performance-analysis"
              >
                Key Investor Infos
              </a>
              <a
                className="px-5 py-2.5 rounded border border-[#d9def0] text-[13px] uppercase tracking-[0.12em] font-medium text-[#0b1035] hover:bg-[#f5f7ff]"
                href="/legal-information"
              >
                Regulatory Details
              </a>
            </div>
          </section>

          <section className="grid md:grid-cols-2 gap-6">
            <article className="border border-[#d9def0] rounded-xl p-7 bg-white">
              <h2 className="text-[22px] leading-[1.3] text-[#0b1035] mb-1">USD Share Class</h2>
              <p className="text-sm text-[#5f6477] mb-3">USD Fee Structure</p>
              <p className="text-[#2b3045]">
                Up to 1.5% all-in, sign-on fee with performance fee with high-water mark
              </p>
              <ul className="mt-5 text-sm text-[#2b3045] space-y-1">
                <li>ISIN: LI0325349897</li>
                <li>WKN: A2DWTX</li>
                <li>Bloomberg: IMPGLMT LE</li>
              </ul>
            </article>
            <article className="border border-[#d9def0] rounded-xl p-7 bg-white">
              <h2 className="text-[22px] leading-[1.3] text-[#0b1035] mb-1">CHF Hedged Share Class</h2>
              <p className="text-sm text-[#5f6477] mb-3">CHF Hedged Fee Structure</p>
              <p className="text-[#2b3045]">
                Up to 1.27% all-in, waived sign-on fee with performance fee with high-water mark
                (Soft-Close)
              </p>
              <ul className="mt-5 text-sm text-[#2b3045] space-y-1">
                <li>ISIN: LI1454290381</li>
                <li>WKN: A41AWF</li>
                <li>Bloomberg: IMPGMCH LE</li>
              </ul>
            </article>
          </section>

          <section className="rounded-xl border border-[#d9def0] p-6 md:p-8 bg-white">
            <h2 className="text-[23px] leading-[1.3] text-[#0b1035] mb-4">Our Investment Objective</h2>
            <p className="text-[#2b3045] leading-relaxed">
              Focused on above-average, long-term capital appreciation through exposure to
              transformational megatrends.
            </p>
          </section>

          <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {details.map(([label, value]) => (
              <article key={label} className="rounded-lg border border-[#d9def0] p-4 bg-white">
                <p className="text-[12px] tracking-wide uppercase text-[#0040ff] mb-2">{label}</p>
                <p className="text-sm text-[#2b3045]">{value}</p>
              </article>
            ))}
          </section>
        </div>
    </main>
  )
}
