import type { Metadata } from 'next/types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { notFound } from 'next/navigation'
import { ArticlesArchiveLayout } from '../../_components/ArticlesArchiveLayout'

export const revalidate = 600

type Args = {
  params: Promise<{
    slug: string
  }>
}

const PAGE_SIZE = 12

export default async function Page({ params: paramsPromise }: Args) {
  const { slug } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
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

  return {
    alternates: {
      canonical: `/articles/category/${decodedSlug}`,
    },
    title: `Articles - ${decodedSlug.replace(/-/g, ' ')}`,
    openGraph: {
      url: `/articles/category/${decodedSlug}`,
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
      slug: true,
    },
  })

  return categories.docs
    .filter((category) => typeof category.slug === 'string' && category.slug)
    .map((category) => ({
      slug: String(category.slug),
    }))
}
