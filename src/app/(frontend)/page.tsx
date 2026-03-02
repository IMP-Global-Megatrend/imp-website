import { HeroSection } from './_components/HeroSection'
import { RegulatoryStrip } from './_components/RegulatoryStrip'
import { MegatrendCard } from './_components/MegatrendCard'
import { BottomGrid } from './_components/BottomGrid'
import { RegulatoryNotice } from './_components/RegulatoryNotice'
import { getHomeCMSContent } from './_components/getHomeCMSContent'

const trendVisuals = [
  {
    icon: '/images/technology_icon.png',
    image: '/images/megatrend_technology.png',
  },
  {
    icon: '/images/consumer_icon.png',
    image: '/images/megatrend_consumer.png',
  },
  {
    icon: '/images/healthcare_icon.png',
    image: '/images/megatrend_healthcare.png',
  },
  {
    icon: '/images/economic_icon.png',
    image: '/images/megatrend_economic.png',
  },
  {
    icon: '/images/mobility_icon.png',
    image: '/images/megatrend_mobility.png',
  },
  {
    icon: '/images/infrastructure_icon.png',
    image: '/images/megatrend_infrastructure.png',
  },
]

export default async function HomePage() {
  const cms = await getHomeCMSContent()
  const trends = cms.trends.map((trend, index) => ({
    ...trend,
    icon: trendVisuals[index]?.icon ?? trendVisuals[0].icon,
    image: trendVisuals[index]?.image ?? trendVisuals[0].image,
  }))

  return (
    <>
      <HeroSection />
      <RegulatoryStrip />
      <main className="bg-white">
        {trends.map((trend, i) => (
          <MegatrendCard key={trend.title} {...trend} reverse={i % 2 === 1} />
        ))}
      </main>
      <BottomGrid />
      <RegulatoryNotice />
    </>
  )
}
