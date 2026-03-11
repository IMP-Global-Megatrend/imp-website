import type { Metadata } from 'next/types'

import articlesContent from '@/constants/articles-content.json'
import React from 'react'
import { notFound, redirect } from 'next/navigation'
import { buildPaginatedArchiveMetadata } from '@/app/(frontend)/_lib/archiveMetadata'
import {
  ARTICLE_ARCHIVE_PAGE_SIZE,
} from '@/app/(frontend)/articles/_lib/constants'
import { ArticlesArchiveLayout } from '@/app/(frontend)/articles/_components/ArticlesArchiveLayout'
import { getArticleArchivePageData } from '@/app/(frontend)/articles/_lib/getArticleArchivePageData'
import { buildStaticPageParams, parsePositivePageOr404 } from '@/app/(frontend)/_lib/archivePagination'

export const revalidate = 600

type Args = {
  params: Promise<{
    pageNumber: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { pageNumber } = await paramsPromise
  const sanitizedPageNumber = parsePositivePageOr404(pageNumber)
  if (sanitizedPageNumber === 1) redirect('/articles')

  const { posts, categoryLinks } = await getArticleArchivePageData(sanitizedPageNumber)
  if (posts.totalDocs > 0 && sanitizedPageNumber > posts.totalPages) notFound()

  return (
    <ArticlesArchiveLayout
      heroTitle={articlesContent.heading}
      heroSubtitle={articlesContent.heroSubtitle}
      breadcrumbItems={[
        { label: 'Home', href: '/' },
        { label: 'Articles', href: '/articles' },
        { label: `Page ${sanitizedPageNumber}` },
      ]}
      posts={posts.docs}
      currentPage={posts.page || sanitizedPageNumber}
      totalPages={posts.totalPages}
      totalDocs={posts.totalDocs}
      basePath="/articles"
      startIndex={(sanitizedPageNumber - 1) * ARTICLE_ARCHIVE_PAGE_SIZE}
      categoryLinks={categoryLinks}
    />
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { pageNumber } = await paramsPromise
  return buildPaginatedArchiveMetadata({
    basePath: '/articles',
    pageNumber,
    titleTemplate: articlesContent.pagination.titleTemplate,
    descriptionTemplate: articlesContent.pagination.descriptionTemplate,
    openGraphImageUrl: '/images/og/posts-og.png',
  })
}

export async function generateStaticParams() {
  const { posts } = await getArticleArchivePageData(1)
  return buildStaticPageParams(posts.totalDocs, ARTICLE_ARCHIVE_PAGE_SIZE)
}
