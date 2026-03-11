import type { Metadata } from 'next/types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { notFound, redirect } from 'next/navigation'
import { ArticlesArchiveLayout } from '../../../../_components/ArticlesArchiveLayout'

export const revalidate = 600

type Args = {
  params: Promise<{
    slug: string
    pageNumber: string
  }>
}

const PAGE_SIZE = 12

export default async function Page({ params: paramsPromise }: Args) {
  const { slug, pageNumber } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const sanitizedPageNumber = Number(pageNumber)
  if (!Number.isInteger(sanitizedPageNumber) || sanitizedPageNumber < 1) notFound()
  if (sanitizedPageNumber === 1) redirect(`/articles/category/${decodedSlug}`)

  const payload = await getPayload({ config: configPromise })
  const categoryResult = await payload.find({
    collection: 'categories',
    where: {
      slug: {
        equals: decodedSlug,
      },
    },
    limit: 1,
    pagination: false,
    depth: 0,
  })
  const category = categoryResult.docs?.[0]
  if (!category) notFound()

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    page: sanitizedPageNumber,
    limit: PAGE_SIZE,
    overrideAccess: false,
    where: {
      categories: {
        contains: category.id,
      },
    },
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
  if (posts.totalDocs > 0 && sanitizedPageNumber > posts.totalPages) notFound()

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
      startIndex={(sanitizedPageNumber - 1) * PAGE_SIZE}
    />
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug, pageNumber } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const numericPage = Number(pageNumber)
  const canonicalPath =
    Number.isInteger(numericPage) && numericPage > 1
      ? `/articles/category/${decodedSlug}/page/${numericPage}`
      : `/articles/category/${decodedSlug}`

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
  const payload = await getPayload({ config: configPromise })
  const categories = await payload.find({
    collection: 'categories',
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      id: true,
      slug: true,
    },
  })

  const params: Array<{ slug: string; pageNumber: string }> = []
  for (const category of categories.docs || []) {
    if (!category?.slug || !category?.id) continue

    const countResult = await payload.count({
      collection: 'posts',
      overrideAccess: false,
      where: {
        categories: {
          contains: category.id,
        },
      },
    })
    const totalPages = Math.ceil((countResult.totalDocs || 0) / PAGE_SIZE)
    for (let pageNumber = 2; pageNumber <= totalPages; pageNumber++) {
      params.push({
        slug: String(category.slug),
        pageNumber: String(pageNumber),
      })
    }
  }

  return params
}
