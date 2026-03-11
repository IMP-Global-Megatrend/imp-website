import type { Metadata } from 'next/types'

import React from 'react'
import { notFound, redirect } from 'next/navigation'
import { ARTICLE_ARCHIVE_PAGE_SIZE } from '@/app/(frontend)/articles/_lib/constants'
import { ArticlesArchiveLayout } from '@/app/(frontend)/articles/_components/ArticlesArchiveLayout'
import {
  getCategoryArchivePageData,
  getCategoryArchiveStaticParams,
} from '@/app/(frontend)/articles/_lib/getCategoryArchivePageData'
import { canonicalPathForPage, parsePositivePageOr404 } from '@/app/(frontend)/_lib/archivePagination'

export const revalidate = 600

type Args = {
  params: Promise<{
    slug: string
    pageNumber: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { slug, pageNumber } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const sanitizedPageNumber = parsePositivePageOr404(pageNumber)
  if (sanitizedPageNumber === 1) redirect(`/articles/category/${decodedSlug}`)

  const { category, posts } = await getCategoryArchivePageData(decodedSlug, sanitizedPageNumber)

  return (
    <ArticlesArchiveLayout
      heroTitle={category.title || 'Category'}
      heroSubtitle="Browse articles in this category."
      breadcrumbItems={[
        { label: 'Home', href: '/' },
        { label: 'Articles', href: '/articles' },
        { label: category.title || 'Category', href: `/articles/category/${decodedSlug}` },
        { label: `Page ${sanitizedPageNumber}` },
      ]}
      posts={posts.docs}
      currentPage={posts.page || sanitizedPageNumber}
      totalPages={posts.totalPages}
      totalDocs={posts.totalDocs}
      basePath={`/articles/category/${decodedSlug}`}
      startIndex={(sanitizedPageNumber - 1) * ARTICLE_ARCHIVE_PAGE_SIZE}
    />
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug, pageNumber } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const numericPage = Number(pageNumber)
  const canonicalPath = canonicalPathForPage(`/articles/category/${decodedSlug}`, numericPage)

  return {
    alternates: {
      canonical: canonicalPath,
    },
    title: `Articles - ${decodedSlug.replace(/-/g, ' ')} - Page ${pageNumber}`,
    openGraph: {
      url: canonicalPath,
    },
  }
}

export async function generateStaticParams() {
  return getCategoryArchiveStaticParams()
}
