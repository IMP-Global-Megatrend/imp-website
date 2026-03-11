import type { Post } from '@/payload-types'
import Link from 'next/link'
import React from 'react'
import PageClient from '../../posts/page.client'
import { Breadcrumb } from '../../_components/Breadcrumb'
import { PageHero } from '../../_components/PageHero'
import { ArticlesAlternatingList } from './ArticlesAlternatingList'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'

type ArticleListItem = Pick<
  Post,
  'id' | 'slug' | 'title' | 'meta' | 'heroImage' | 'populatedAuthors' | 'publishedAt'
>

type BreadcrumbItem = {
  label: string
  href?: string
}

type CategoryLink = {
  title: string
  slug: string
  count: number
}

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
      <PageClient />
      <PageHero
        title={heroTitle}
        subtitle={heroSubtitle}
        palette={{ color1: '#2b3dea', color2: 'oklch(0.47 0.12 174)', color3: 'oklch(0.47 0.10 136)' }}
      />

      <div className="container pt-12 md:pt-14 mb-4">
        <Breadcrumb items={breadcrumbItems} textClassName="text-[16px] md:text-[17px]" />
        {categoryLinks.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 font-display text-[12px] md:text-[13px] uppercase tracking-[0.12em] text-[#5f6477]">
              Categories
            </p>
            <div className="flex flex-wrap gap-2">
              {categoryLinks.map((category) => (
                <Link
                  key={category.slug}
                  href={`/articles/category/${category.slug}`}
                  className="inline-flex items-center rounded-full border border-[#d9def0] bg-[#f4f6fb] px-3 py-1 font-display text-[12px] md:text-[13px] uppercase tracking-[0.08em] text-[#2b3045]"
                >
                  {category.title} ({category.count})
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <ArticlesAlternatingList posts={posts} startIndex={startIndex} />

      <div className="container pt-6 md:pt-8 pb-14 md:pb-16">
        <div className="mb-8">
          <PageRange
            collectionLabels={{ plural: 'Articles', singular: 'Article' }}
            currentPage={currentPage}
            limit={12}
            totalDocs={totalDocs}
          />
        </div>
        {totalPages > 1 && currentPage && (
          <Pagination basePath={basePath} page={currentPage} totalPages={totalPages} />
        )}
      </div>
    </main>
  )
}
