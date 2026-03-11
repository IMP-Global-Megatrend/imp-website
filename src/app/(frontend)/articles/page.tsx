import type { Metadata } from 'next/types'

import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import articlesContent from '@/constants/articles-content.json'
import fallbacks from '@/constants/fallbacks.json'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { ArticlesArchiveLayout } from './_components/ArticlesArchiveLayout'
import { getArticleCategoryLinks } from './_lib/getArticleCategoryLinks'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function Page() {
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      authors: true,
      publishedAt: true,
      categories: true,
      heroImage: true,
      meta: true,
      populatedAuthors: true,
    },
  })
  const categoryLinks = await getArticleCategoryLinks(payload)

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
