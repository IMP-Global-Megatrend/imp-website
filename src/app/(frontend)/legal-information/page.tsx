import type { Metadata } from 'next'
import { getCMSPageBySlug } from '../_components/getCMSPageBySlug'
import { PageHero } from '../_components/PageHero'
import RichText from '@/components/RichText'
import fallbacks from '@/constants/fallbacks.json'
import { generateMeta } from '@/utilities/generateMeta'
import { notFound } from 'next/navigation'

export default async function LegalPage() {
  const cmsPage = await getCMSPageBySlug('legal-information')
  if (!cmsPage) notFound()

  const contentColumns = (Array.isArray(cmsPage.layout) ? cmsPage.layout : [])
    .flatMap((block) => {
      if ((block as { blockType?: string }).blockType !== 'content') return []
      const columns = (block as { columns?: unknown[] }).columns
      return Array.isArray(columns) ? columns : []
    })
    .filter((column) => Boolean((column as { richText?: unknown }).richText))

  return (
    <main className="bg-white text-[#0b1035]">
      <PageHero
        title={cmsPage.title || fallbacks.pageTitles.legalInformation}
        palette={{ color1: '#2b3dea', color2: 'oklch(0.45 0.12 78)', color3: 'oklch(0.45 0.10 58)' }}
      />

      <div className="container py-16 md:py-20 max-w-4xl">
        <div className="space-y-8 text-[#2b3045] text-[15px] leading-relaxed">
          {contentColumns.map((column, index) => {
            const richText = (column as { richText?: unknown }).richText
            if (!richText) return null

            return (
              <RichText
                key={`legal-content-${index}`}
                data={richText as never}
                enableGutter={false}
                className="max-w-none prose md:prose-md text-[#2b3045]"
              />
            )
          })}
        </div>
      </div>
    </main>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const cmsPage = await getCMSPageBySlug('legal-information')
  if (cmsPage) return generateMeta({ doc: cmsPage })

  return fallbacks.metadata.legalInformation
}
