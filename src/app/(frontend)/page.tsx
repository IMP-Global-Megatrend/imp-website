import { HeroSection } from './_components/HeroSection'
import { RegulatoryStrip } from './_components/RegulatoryStrip'
import { MegatrendCard } from './_components/MegatrendCard'
import { BottomGrid, ExploreMegatrendsCard } from './_components/BottomGrid'
import { getHomeCMSContent } from './_components/getHomeCMSContent'
import megatrendsContent from '@/constants/megatrends-content.json'

const megatrendAnchorsByTitle = Object.fromEntries(
  megatrendsContent.megatrends.map((trend) => [trend.title, trend.anchor]),
) as Record<string, string>

export default async function HomePage() {
  const cms = await getHomeCMSContent()

  return (
    <>
      <HeroSection />
      <RegulatoryStrip />
      <main className="bg-white">
        <section className="bg-white pt-8 pb-0 md:pt-10 md:pb-0">
          <div className="container">
            <ExploreMegatrendsCard />
          </div>
        </section>
        {cms.trends.map((trend, i) => {
          return (
            <div key={`${trend.title}-${i}`}>
              <MegatrendCard
                {...trend}
                detailsHref={`/megatrends#${megatrendAnchorsByTitle[trend.title] || ''}`}
                detailsIcon="trendingUp"
                reverse={i % 2 === 1}
                noTopBorder={i === 0}
                animationDelayMs={i * 90}
              />
            </div>
          )
        })}
      </main>
      <BottomGrid />
    </>
  )
}
