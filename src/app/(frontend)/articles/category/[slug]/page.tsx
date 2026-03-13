import type { Metadata } from 'next/types'

import React from 'react'
import { ArticlesArchiveLayout } from '@/app/(frontend)/articles/_components/ArticlesArchiveLayout'
import { getArticleCategoryStaticParams, getCategoryArchivePageData } from '@/app/(frontend)/articles/_lib/getCategoryArchivePageData'
import { ogImagePathForRoute } from '@/utilities/ogImage'

export const revalidate = 600

type Args = {
  params: Promise<{
    slug: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { slug } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const { category, posts } = await getCategoryArchivePageData(decodedSlug)

  return (
    <ArticlesArchiveLayout
      heroTitle={category.title || 'Category'}
      heroSubtitle="Browse articles in this category."
      breadcrumbItems={[
        { label: 'Home', href: '/' },
        { label: 'Articles', href: '/articles' },
        { label: category.title || 'Category' },
      ]}
      posts={posts.docs}
      currentPage={posts.page || 1}
      totalPages={posts.totalPages}
      totalDocs={posts.totalDocs}
      basePath={`/articles/category/${decodedSlug}`}
    />
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const canonicalPath = `/articles/category/${decodedSlug}`
  const ogImageUrl = ogImagePathForRoute(canonicalPath)

  return {
    alternates: {
      canonical: canonicalPath,
    },
    title: `Articles - ${decodedSlug.replace(/-/g, ' ')}`,
    openGraph: {
      images: [{ url: ogImageUrl }],
      url: canonicalPath,
    },
    twitter: {
      card: 'summary_large_image',
      images: [ogImageUrl],
      title: `Articles - ${decodedSlug.replace(/-/g, ' ')}`,
    },
  }
}

export async function generateStaticParams() {
  return getArticleCategoryStaticParams()
}
