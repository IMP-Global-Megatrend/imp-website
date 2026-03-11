import type { ReactNode } from 'react'
import { PageHero } from '@/app/(frontend)/_components/PageHero'

type FormLandingLayoutProps = {
  heroTitle: string
  heroSubtitle?: string
  heroTitleClassName?: string
  heroSubtitleClassName?: string
  palette: {
    color1: string
    color2: string
    color3: string
  }
  children: ReactNode
  afterContent?: ReactNode
}

export function FormLandingLayout({
  heroTitle,
  heroSubtitle,
  heroTitleClassName,
  heroSubtitleClassName,
  palette,
  children,
  afterContent,
}: FormLandingLayoutProps) {
  return (
    <main className="bg-white text-[#0b1035]">
      <PageHero
        title={heroTitle}
        subtitle={heroSubtitle}
        titleClassName={heroTitleClassName}
        subtitleClassName={heroSubtitleClassName}
        palette={palette}
      />
      {children}
      {afterContent}
    </main>
  )
}
