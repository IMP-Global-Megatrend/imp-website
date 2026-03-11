import type { Metadata } from 'next/types'

import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { notFound } from 'next/navigation'
import { ArticlesAlternatingList } from '../../_components/ArticlesAlternatingList'
import { Breadcrumb } from '../../../_components/Breadcrumb'
import PageClient from '../../../posts/page.client'
import { PageHero } from '../../../_components/PageHero'

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
    <main className="bg-white text-[#0b1035]">
      <PageClient />
      <PageHero
        title={category.title || 'Category'}
        subtitle="Browse articles in this category."
        palette={{ color1: '#2b3dea', color2: 'oklch(0.47 0.12 174)', color3: 'oklch(0.47 0.10 136)' }}
      />

      <div className="container pt-12 md:pt-14 mb-4">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Articles', href: '/articles' },
            { label: category.title || 'Category' },
          ]}
          textClassName="text-[16px] md:text-[17px]"
        />
      </div>

      <ArticlesAlternatingList posts={posts.docs} />

      <div className="container pt-6 md:pt-8 pb-14 md:pb-16">
        <div className="mb-8">
          <PageRange
            collectionLabels={{ plural: 'Articles', singular: 'Article' }}
            currentPage={posts.page}
            limit={PAGE_SIZE}
            totalDocs={posts.totalDocs}
          />
        </div>
        {posts.totalPages > 1 && posts.page && (
          <Pagination basePath={`/articles/category/${decodedSlug}`} page={posts.page} totalPages={posts.totalPages} />
        )}
      </div>
    </main>
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
