import { PageHero, type PageHeroProps } from '@/app/(frontend)/_components/PageHero'
import { resolvePageHeroCopy } from '@/app/(frontend)/_lib/resolvePageHeroCopy'

type CMSPageHeroProps = Omit<PageHeroProps, 'title' | 'subtitle'> & {
  page: unknown
  fallbackTitle: string
  fallbackSubtitle?: string
  legacyTitleKeys?: string[]
  legacySubtitleKeys?: string[]
}

export function CMSPageHero({
  page,
  fallbackTitle,
  fallbackSubtitle,
  legacyTitleKeys,
  legacySubtitleKeys,
  ...heroProps
}: CMSPageHeroProps) {
  const { title, subtitle } = resolvePageHeroCopy({
    page,
    fallbackTitle,
    fallbackSubtitle,
    legacyTitleKeys,
    legacySubtitleKeys,
  })

  return (
    <PageHero
      {...heroProps}
      title={title}
      subtitle={subtitle}
    />
  )
}
