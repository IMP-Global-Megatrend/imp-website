import type { Metadata } from 'next'
import { HeroSection } from '@/app/(frontend)/_components/HeroSection'
import { RegulatoryStrip } from '@/app/(frontend)/_components/RegulatoryStrip'
import { MegatrendCard } from '@/app/(frontend)/_components/MegatrendCard'
import { BottomGrid, ExploreMegatrendsCard } from '@/app/(frontend)/_components/BottomGrid'
import { getCMSPageBySlug } from '@/app/(frontend)/_components/getCMSPageBySlug'
import { getHomeCMSContent } from '@/app/(frontend)/_components/getHomeCMSContent'
import fallbacks from '@/constants/fallbacks.json'
import megatrendsContent from '@/constants/megatrends-content.json'
import { generateMeta, generateStaticFallbackMeta } from '@/utilities/generateMeta'

const megatrendAnchorsByTitle = Object.fromEntries(
  megatrendsContent.megatrends.map((trend) => [trend.title, trend.anchor]),
) as Record<string, string>

export async function generateMetadata(): Promise<Metadata> {
  const cmsPage = await getCMSPageBySlug('home')
  const homeFallback = fallbacks.metadata.home
  if (cmsPage) {
    return generateMeta({
      doc: {
        ...cmsPage,
        meta: {
          ...cmsPage.meta,
          title: cmsPage.meta?.title || homeFallback.title,
          description: cmsPage.meta?.description || homeFallback.description,
        },
      },
    })
  }

  return generateStaticFallbackMeta('/', homeFallback)
}

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
                noBottomBorder={i === cms.trends.length - 1}
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
