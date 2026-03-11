import React from 'react'
import LightHeaderPageClient from '@/app/(frontend)/_components/LightHeaderPageClient'
import { Breadcrumb } from '@/app/(frontend)/_components/Breadcrumb'
import { PageHero } from '@/app/(frontend)/_components/PageHero'
import type { ArticleListItem, BreadcrumbItem, CategoryLink } from '@/app/(frontend)/articles/_lib/types'
import { ArchiveRangeAndPagination } from '@/app/(frontend)/articles/_components/ArchiveRangeAndPagination'
import { ArticleCategoryChips } from '@/app/(frontend)/articles/_components/ArticleCategoryChips'
import { ArticlesAlternatingList } from '@/app/(frontend)/articles/_components/ArticlesAlternatingList'

type ArticlesArchiveLayoutProps = {
  heroTitle: string
  heroSubtitle?: string
  breadcrumbItems: BreadcrumbItem[]
  posts: ArticleListItem[]
  currentPage: number
  totalPages: number
  totalDocs: number
  basePath: string
  startIndex?: number
  categoryLinks?: CategoryLink[]
}

export function ArticlesArchiveLayout({
  heroTitle,
  heroSubtitle,
  breadcrumbItems,
  posts,
  currentPage,
  totalPages,
  totalDocs,
  basePath,
  startIndex = 0,
  categoryLinks = [],
}: ArticlesArchiveLayoutProps) {
  return (
    <main className="bg-white text-[#0b1035]">
      <LightHeaderPageClient />
      <PageHero
        title={heroTitle}
        subtitle={heroSubtitle}
        palette={{ color1: '#2b3dea', color2: 'oklch(0.47 0.12 174)', color3: 'oklch(0.47 0.10 136)' }}
      />

      <div className="container pt-12 md:pt-14 mb-4">
        <Breadcrumb items={breadcrumbItems} textClassName="text-[16px] md:text-[17px]" />
        <ArticleCategoryChips categories={categoryLinks} className="mt-4" showCounts showHeading />
      </div>

      <ArticlesAlternatingList posts={posts} startIndex={startIndex} />

      <ArchiveRangeAndPagination
        basePath={basePath}
        currentPage={currentPage}
        totalDocs={totalDocs}
        totalPages={totalPages}
      />
    </main>
  )
}
