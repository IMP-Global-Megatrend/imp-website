import type { Metadata } from 'next/types'

import articlesContent from '@/constants/articles-content.json'
import fallbacks from '@/constants/fallbacks.json'
import React from 'react'
import { ArticlesArchiveLayout } from '@/app/(frontend)/articles/_components/ArticlesArchiveLayout'
import { getArticleArchivePageData } from '@/app/(frontend)/articles/_lib/getArticleArchivePageData'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function Page() {
  const { posts, categoryLinks } = await getArticleArchivePageData()

  return (
    <ArticlesArchiveLayout
      heroTitle={articlesContent.heading}
      heroSubtitle={articlesContent.heroSubtitle}
      breadcrumbItems={[
        { label: 'Home', href: '/' },
        { label: 'Articles' },
      ]}
      posts={posts.docs}
      currentPage={posts.page || 1}
      totalPages={posts.totalPages}
      totalDocs={posts.totalDocs}
      basePath="/articles"
      categoryLinks={categoryLinks}
    />
  )
}

export function generateMetadata(): Metadata {
  const fallback = fallbacks.metadata.articles

  return {
    ...fallback,
    alternates: {
      canonical: '/articles',
    },
    openGraph: {
      ...fallback.openGraph,
      url: '/articles',
    },
    twitter: {
      card: 'summary_large_image',
      description: fallback.description,
      images: fallback.openGraph?.images,
      title: fallback.title,
    },
  }
}
