import { getCMSPageBySlug } from '../_components/getCMSPageBySlug'
import { CMSPageContent } from '../_components/CMSPageContent'
import { PageHero } from '../_components/PageHero'
import { AllocationPanel } from './AllocationPanel'
import { InvestmentProcessTimeline } from './InvestmentProcessTimeline'
import { TopHoldingsSection } from './TopHoldingsSection'

const strategySteps = [
  {
    title: 'Identifying Megatrends',
    src: '/images/ps_identifying_megatrends.png',
    items: [
      { heading: 'Global and Regional Analysis', body: 'We start by keeping a close eye on long-term shifts in society, technology, demographics, economics, and the environment. We use a combination of macroeconomic data, societal indicators, and forward-looking models to identify emerging themes.' },
      { heading: 'Research and Thought Leadership', body: 'We continuously review research reports, academic papers, and insights from leading think tanks. Conferences, white papers, and discussions with subject matter experts in various industries also help shape our view.' },
      { heading: 'Data-Driven Approach', body: 'We also rely on data analytics, looking at historical patterns and forecasts in sectors such as renewable energy, artificial intelligence, health & wellness, and climate change, among others.' },
    ],
  },
  {
    title: 'Defining and Prioritizing Megatrends',
    src: '/images/ps_defining_prioritizing.png',
    items: [
      { heading: 'Long-Term Sustainability', body: 'A key element in how we prioritize megatrends is their long-term sustainability. We focus on trends that will evolve over decades rather than those with short-lived hype.' },
      { heading: 'Market Readiness', body: 'We evaluate the readiness of various markets to adapt to and adopt these megatrends. Some trends may be nascent, while others may already be in the scaling phase.' },
      { heading: 'Emerging Technologies', body: 'Technological advancements often act as a catalyst for megatrends. For example, advancements in AI, quantum computing, or biotechnology can rapidly accelerate certain megatrends and create new opportunities.' },
    ],
  },
  {
    title: 'Selecting Companies within a Megatrend',
    src: '/images/ps_selecting_companies.png',
    items: [
      { heading: 'Innovation and Leadership', body: 'When selecting companies within a particular megatrend, we prioritize innovation. We look for companies that are at the forefront of the trend.' },
      { heading: 'Financial Health and Growth Potential', body: 'Companies must not only align with the megatrend but also demonstrate strong financial health and growth potential. We perform rigorous fundamental analysis.' },
      { heading: 'Market Share and Competitive Advantage', body: 'We focus on companies that have a competitive advantage in their respective markets—whether through intellectual property, brand recognition, or operational efficiency.' },
    ],
  },
  {
    title: 'Regular Reassessment',
    src: '/images/ps_regular_reassessment.png',
    items: [
      { heading: 'Ongoing Monitoring', body: 'We continuously monitor the megatrends and the companies we invest in, adjusting our strategy as the trends evolve and new information comes to light.' },
      { heading: 'Emerging Opportunities', body: 'As new trends surface, we remain open to exploring opportunities outside our current scope, allowing us to adapt and grow alongside new opportunities.' },
    ],
  },
]

const investmentProcess = [
  'Global macroeconomic trends, selecting geographic regions and sectors/subsectors forecasted to outperform',
  'Generate ideas and identify long-term global growth and sustainable investment opportunities',
  'Collect transparent information and perform due diligence and research analysis',
  'Evaluate and select investments on technical and fundamental methodology/stress testing',
  'Assess portfolio diversification, weighting, risk tolerance/aversion, performance objectives and regulatory compliance',
  'Ensure and analyze best execution of transaction, trading liquidity/efficiency/reliability and execution/settlement',
  'Continuous monitoring, rebalancing, and reviewing of investments and portfolio risks',
  'Disciplined buying/selling policy according to investment committee/management guidelines and constraints',
]

const allocations = {
  megatrends: [
    ['Technology & Technological Advancements', '24.2', '#0F3BBF'],
    ['Changing Consumer Behavior & Demographics', '19.8', '#F6D800'],
    ['Smart Infrastructure & Smart City', '19.2', '#FF8F00'],
    ['Mobility & Transportation', '11.7', '#7C3BBF'],
    ['Shift in Economic Power', '11.5', '#7EE815'],
    ['Healthcare & Longevity Revolution', '10.7', '#FF7FBF'],
    ['Fixed Income', '1.3', '#A86D6D'],
    ['Cash', '1.0', '#9DB81F'],
  ] as Array<[string, string, string]>,
  geographic: [
    ['USA', '64.7', '#0F3BBF'],
    ['Italy', '7.6', '#FF8F00'],
    ['France', '5.5', '#F6D800'],
    ['Uruguay', '4.5', '#7EE815'],
    ['China', '4.3', '#7C3BBF'],
    ['Switzerland', '4.2', '#FF7FBF'],
    ['Denmark', '2.9', '#A86D6D'],
    ['Netherlands', '1.9', '#294736'],
    ['Turkey', '0.7', '#FC0844'],
    ['United Kingdom', '0.7', '#9DB81F'],
  ] as Array<[string, string, string]>,
  sectors: [
    ['Consumer Discretionary', '24.7', '#0F3BBF'],
    ['Info. Technology', '21.7', '#F6D800'],
    ['Industrials', '12.5', '#FF8F00'],
    ['Healthcare', '10.6', '#7C3BBF'],
    ['Consumer Staples', '8.5', '#7EE815'],
    ['Comm. Services', '8.3', '#FF7FBF'],
    ['Utilities', '6.9', '#A86D6D'],
    ['Financials', '3.9', '#9DB81F'],
  ] as Array<[string, string, string]>,
}

const topHoldings: Array<[string, string, string]> = [
  ['NVIDIA Corp.', '8.4', '#0a2a8f'],
  ['Apple Inc.', '7.3', '#0f3bbf'],
  ['Tesla Inc.', '6.2', '#1a4fd4'],
  ['Alphabet Inc.', '5.9', '#2b63e5'],
  ['Walmart Inc.', '5.0', '#4078ed'],
  ['Prysmian S.p.A', '4.6', '#5a8ef2'],
  ['MercadoLibre, Inc.', '4.5', '#74a3f5'],
  ['Galderma Group AG', '4.2', '#8eb8f8'],
  ['Duke Energy Corp.', '3.6', '#a8ccfa'],
  ['Intuitive Surgical Inc.', '3.6', '#c2dffc'],
  ['Other', '46.7', '#dbeaff'],
]

export default async function PortfolioStrategyPage() {
  const cmsPage = await getCMSPageBySlug('portfolio-strategy')
  if (cmsPage) {
    return <CMSPageContent page={cmsPage as never} />
  }

  return (
    <main className="bg-white text-[#0b1035]">
        <PageHero
          title={'High-Conviction\nGlobal Thematic'}
          subtitle="The investment objective aims to generate a long-term, above average return. Therefore, in principle global direct and indirect investments in securities of listed companies are made. Shares as well as Exchange Traded Funds are being employed, giving us access to all relevant markets and segments around the globe."
          palette={{ color1: 'oklch(0.46 0.14 40)', color2: 'oklch(0.46 0.16 24)', color3: 'oklch(0.46 0.12 62)' }}
          subtitleClassName="mt-5 text-[16px] max-w-3xl leading-[1.7]"
        />

        {/* Strategy Steps */}
        <div className="pb-0">
          {strategySteps.map((step, idx) => (
            <section
              key={step.title}
              className={`${idx === 0 ? '' : 'border-t border-[#d9def0]'} ${idx === strategySteps.length - 1 ? 'border-b border-[#d9def0]' : ''} scroll-mt-24 pt-16 md:pt-20 pb-0`}
            >
              <div className="container">
                <div
                  className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-stretch ${idx % 2 === 1 ? 'lg:direction-rtl' : ''}`}
                  style={idx % 2 === 1 ? { direction: 'rtl' } : undefined}
                >
                  <div className="h-full" style={idx % 2 === 1 ? { direction: 'ltr' } : undefined}>
                    <div className="flex h-full items-stretch gap-4">
                      <div className="hidden md:flex items-stretch gap-2 shrink-0 self-stretch">
                        <span
                          className="font-display text-right text-[#0b1035] text-[18px] font-medium whitespace-nowrap"
                          style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}
                        >
                          {step.title}
                        </span>
                        <span aria-hidden className="w-px self-stretch bg-[#d9def0]" />
                      </div>
                      <div className="flex-1 self-start pb-5 md:pb-6">
                        <h2 className="md:hidden text-[24px] leading-[1.25] text-[#0b1035] mb-5">{step.title}</h2>
                        <div className="space-y-5">
                          {step.items.map((item) => (
                            <div key={item.heading}>
                              <h3 className="text-[16px] font-semibold text-[#0b1035] mb-1">{item.heading}</h3>
                              <p className="text-[#2b3045] text-[15px] leading-relaxed">{item.body}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`flex items-center justify-center ${idx % 2 === 1 ? 'lg:pr-8' : 'lg:pl-8'}`}
                    style={idx % 2 === 1 ? { direction: 'ltr' } : undefined}
                  >
                    <img src={step.src} alt={step.title} className="w-full h-auto object-contain" />
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* Investment Process */}
        <section className="bg-[#f5f7ff] py-16 md:py-20">
          <div className="container">
            <h2 className="text-[28px] leading-[1.2] text-[#0b1035] mb-8 text-center">
              Investment Process
            </h2>
            <InvestmentProcessTimeline items={investmentProcess} />
          </div>
        </section>

        {/* Portfolio Overview */}
        <section className="container py-16 md:py-20">
          <h2 className="text-center text-[24px] md:text-[28px] leading-[1.2] text-[#0b1035] mb-6">
            Portfolio Overview
          </h2>
          <div className="grid lg:grid-cols-3 gap-8">
            {(
              [
                ['Megatrend Allocations', allocations.megatrends],
                ['Geographic Allocations', allocations.geographic],
                ['Sector Allocations', allocations.sectors],
              ] as const
            ).map(([title, data]) => (
              <AllocationPanel key={title} title={title} data={data as Array<[string, string, string]>} />
            ))}
          </div>
        </section>

        {/* Top Holdings */}
        <section className="bg-white border-t border-[#d9def0] py-16 md:py-20">
          <div className="container">
            <h2 className="text-[28px] leading-[1.2] text-[#0b1035] mb-8">Top Holdings</h2>
            <TopHoldingsSection holdings={topHoldings} />
          </div>
        </section>
    </main>
  )
}
