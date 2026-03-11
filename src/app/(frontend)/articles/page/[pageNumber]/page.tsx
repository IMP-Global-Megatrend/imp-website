import type { Metadata } from 'next/types'

import articlesContent from '@/constants/articles-content.json'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { notFound, redirect } from 'next/navigation'
import { ArticlesArchiveLayout } from '../../_components/ArticlesArchiveLayout'
import { getArticleCategoryLinks } from '../../_lib/getArticleCategoryLinks'

export const revalidate = 600

type Args = {
  params: Promise<{
    pageNumber: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { pageNumber } = await paramsPromise
  const payload = await getPayload({ config: configPromise })

  const sanitizedPageNumber = Number(pageNumber)

  if (!Number.isInteger(sanitizedPageNumber) || sanitizedPageNumber < 1) notFound()
  if (sanitizedPageNumber === 1) redirect('/articles')

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    page: sanitizedPageNumber,
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
        { label: 'Articles', href: '/articles' },
        { label: `Page ${sanitizedPageNumber}` },
      ]}
      posts={posts.docs}
      currentPage={posts.page || sanitizedPageNumber}
      totalPages={posts.totalPages}
      totalDocs={posts.totalDocs}
      basePath="/articles"
      startIndex={(sanitizedPageNumber - 1) * 12}
      categoryLinks={categoryLinks}
    />
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { pageNumber } = await paramsPromise
  const numericPage = Number(pageNumber)
  const canonicalPath =
    Number.isInteger(numericPage) && numericPage > 1 ? `/articles/page/${numericPage}` : '/articles'

  return {
    alternates: {
      canonical: canonicalPath,
    },
    title: articlesContent.pagination.titleTemplate.replace('{pageNumber}', pageNumber || ''),
    description: articlesContent.pagination.descriptionTemplate.replace('{pageNumber}', pageNumber || ''),
    openGraph: {
      images: [{ url: '/images/og/posts-og.png' }],
      url: canonicalPath,
    },
    twitter: {
      card: 'summary_large_image',
      description: articlesContent.pagination.descriptionTemplate.replace('{pageNumber}', pageNumber || ''),
      images: ['/images/og/posts-og.png'],
      title: articlesContent.pagination.titleTemplate.replace('{pageNumber}', pageNumber || ''),
    },
  }
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const { totalDocs } = await payload.count({
    collection: 'posts',
    overrideAccess: false,
  })

  const totalPages = Math.ceil(totalDocs / 12)

  const pages: { pageNumber: string }[] = []

  for (let i = 2; i <= totalPages; i++) {
    pages.push({ pageNumber: String(i) })
  }

  return pages
}
