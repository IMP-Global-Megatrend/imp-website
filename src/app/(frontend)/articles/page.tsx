import type { Metadata } from 'next/types'

import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import articlesContent from '@/constants/articles-content.json'
import fallbacks from '@/constants/fallbacks.json'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from '../posts/page.client'
import { PageHero } from '../_components/PageHero'
import { ArticlesAlternatingList } from './_components/ArticlesAlternatingList'
import { Breadcrumb } from '../_components/Breadcrumb'

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

  return (
    <main className="bg-white text-[#0b1035]">
      <PageClient />
      <PageHero
        title={articlesContent.heading}
        subtitle={articlesContent.heroSubtitle}
        palette={{ color1: '#2b3dea', color2: 'oklch(0.47 0.12 174)', color3: 'oklch(0.47 0.10 136)' }}
      />

      <div className="container pt-12 md:pt-14 mb-4">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Articles' },
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
            limit={12}
            totalDocs={posts.totalDocs}
          />
        </div>
        {posts.totalPages > 1 && posts.page && (
          <Pagination basePath="/articles" page={posts.page} totalPages={posts.totalPages} />
        )}
      </div>
    </main>
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
