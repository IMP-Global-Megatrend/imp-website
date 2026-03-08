import { getCMSPageBySlug } from '../_components/getCMSPageBySlug'
import { PageHero } from '../_components/PageHero'
import RichText from '@/components/RichText'
import fallbacks from '@/constants/fallbacks.json'
import { notFound } from 'next/navigation'

function removeH1HeadingsFromRichText(richText: unknown): unknown {
  if (!richText || typeof richText !== 'object') return richText

  const root = (richText as { root?: { children?: unknown[] } }).root
  if (!root || !Array.isArray(root.children)) return richText

  const filteredChildren = root.children.filter((node) => {
    if (!node || typeof node !== 'object') return true
    const record = node as { type?: string; tag?: string }
    return !(record.type === 'heading' && record.tag === 'h1')
  })

  return {
    ...(richText as Record<string, unknown>),
    root: {
      ...(root as Record<string, unknown>),
      children: filteredChildren,
    },
  }
}

export default async function PrivacyPage() {
  const cmsPage = await getCMSPageBySlug('privacy-policy')
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
        title={cmsPage.title || fallbacks.pageTitles.privacyPolicy}
        subtitle={fallbacks.pageTitles.privacyPolicySubtitle}
        palette={{ color1: '#2b3dea', color2: 'oklch(0.45 0.13 355)', color3: 'oklch(0.45 0.12 36)' }}
        subtitleClassName="max-w-none"
      />

      <div className="container py-16 md:py-20 max-w-4xl">
        <div className="space-y-8 text-[#2b3045] text-[15px] leading-relaxed">
          {contentColumns.map((column, index) => {
            const richText = (column as { richText?: unknown }).richText
            if (!richText) return null

            return (
              <RichText
                key={`privacy-content-${index}`}
                data={removeH1HeadingsFromRichText(richText) as never}
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
