import type { Metadata } from 'next'
import {
  getCMSPageBySlug,
  getCMSPortfolioInvestmentProcessItems,
  getCMSPortfolioStrategySteps,
  getCMSPortfolioStrategyChartData,
} from '@/app/(frontend)/_components/getCMSPageBySlug'
import { PageHero } from '@/app/(frontend)/_components/PageHero'
import { AllocationPanel } from '@/app/(frontend)/portfolio-strategy/AllocationPanel'
import { InvestmentProcessTimeline } from '@/app/(frontend)/portfolio-strategy/InvestmentProcessTimeline'
import { QuoteBandSection } from '@/app/(frontend)/_components/QuoteBandSection'
import { StrategyStepSection } from '@/app/(frontend)/portfolio-strategy/StrategyStepSection'
import { TopHoldingsSection } from '@/app/(frontend)/portfolio-strategy/TopHoldingsSection'
import fallbacks from '@/constants/fallbacks.json'
import portfolioStrategyContent from '@/constants/portfolio-strategy-content.json'
import { generateMeta, generateStaticFallbackMeta } from '@/utilities/generateMeta'

export async function generateMetadata(): Promise<Metadata> {
  const cmsPage = await getCMSPageBySlug('portfolio-strategy')
  if (cmsPage) return generateMeta({ doc: cmsPage })

  return generateStaticFallbackMeta('/portfolio-strategy', fallbacks.metadata.portfolioStrategy)
}

const portfolioStrategyIntroFallback = portfolioStrategyContent.introFallback || fallbacks.portfolioStrategy.intro

export default async function PortfolioStrategyPage() {
  const [cmsPage, cmsChartData, cmsInvestmentProcess, cmsStrategySteps] = await Promise.all([
    getCMSPageBySlug('portfolio-strategy'),
    getCMSPortfolioStrategyChartData(),
    getCMSPortfolioInvestmentProcessItems(),
    getCMSPortfolioStrategySteps(),
  ])
  const pageRecord = (cmsPage && typeof cmsPage === 'object' ? cmsPage : {}) as {
    portfolioStrategyIntro?: unknown
  }
  const portfolioStrategyIntro =
    (typeof pageRecord.portfolioStrategyIntro === 'string' && pageRecord.portfolioStrategyIntro.trim()) ||
    portfolioStrategyIntroFallback
  const strategySteps = cmsStrategySteps.length > 0 ? cmsStrategySteps : portfolioStrategyContent.strategySteps
  const megatrendAllocations = cmsChartData.megatrends
  const geographicAllocations = cmsChartData.geographic
  const sectorAllocations = cmsChartData.sectors
  const topHoldingsData = cmsChartData.topHoldings

  return (
    <main className="bg-white text-[#0b1035]">
        <PageHero
          title={portfolioStrategyContent.heroTitle}
          palette={{ color1: '#2b3dea', color2: 'oklch(0.46 0.16 24)', color3: 'oklch(0.46 0.12 62)' }}
        />

        <QuoteBandSection quotes={[portfolioStrategyIntro]} />

        {/* Strategy Steps */}
        <div className="pb-0">
          {strategySteps.map((step, idx) => (
            <StrategyStepSection key={step.title} step={step} index={idx} total={strategySteps.length} />
          ))}
        </div>

        {/* Investment Process */}
        <section className="bg-[#f5f7ff] pt-10 pb-16 md:pt-12 md:pb-20">
          <div className="container">
            <h2 className="text-[28px] leading-[1.2] text-[#0b1035] mb-8 text-left md:text-center">
              {portfolioStrategyContent.sectionTitles.investmentProcess}
            </h2>
            <InvestmentProcessTimeline items={cmsInvestmentProcess} />
          </div>
        </section>

        {/* Portfolio Overview */}
        <section className="container pt-10 pb-16 md:pt-12 md:pb-20">
          <h2 className="text-left md:text-center text-[24px] md:text-[28px] leading-[1.2] text-[#0b1035] mb-6">
            {portfolioStrategyContent.sectionTitles.portfolioOverview}
          </h2>
          <div className="grid lg:grid-cols-3 gap-8">
            {(
              [
                [portfolioStrategyContent.allocationPanels[0], megatrendAllocations],
                [portfolioStrategyContent.allocationPanels[1], geographicAllocations],
                [portfolioStrategyContent.allocationPanels[2], sectorAllocations],
              ] as const
            ).map(([title, data]) => (
              <AllocationPanel key={title} title={title} data={data as Array<[string, string, string, string?]>} />
            ))}
          </div>
        </section>

        {/* Top Holdings */}
        <section className="bg-white border-t border-[#d9def0] pt-10 pb-16 md:pt-12 md:pb-20">
          <div className="container">
            <h2 className="text-[28px] leading-[1.2] text-[#0b1035] mb-8">
              {portfolioStrategyContent.sectionTitles.topHoldings}
            </h2>
            <TopHoldingsSection holdings={topHoldingsData} />
          </div>
        </section>
    </main>
  )
}
