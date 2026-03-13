import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import fallbacks from '@/constants/fallbacks.json'
import postsContent from '@/constants/posts-content.json'
import { ogImagePathForRoute } from '@/utilities/ogImage'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from '@/app/(frontend)/posts/page.client'
import { POSTS_ARCHIVE_PAGE_SIZE, POSTS_ARCHIVE_SELECT } from '@/app/(frontend)/posts/_lib/constants'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function Page() {
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: POSTS_ARCHIVE_PAGE_SIZE,
    overrideAccess: false,
    select: POSTS_ARCHIVE_SELECT,
  })

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>{postsContent.heading}</h1>
        </div>
      </div>

      <div className="container mb-8">
        <PageRange
          collection="posts"
          currentPage={posts.page}
          limit={POSTS_ARCHIVE_PAGE_SIZE}
          totalDocs={posts.totalDocs}
        />
      </div>

      <CollectionArchive posts={posts.docs} />

      <div className="container">
        {posts.totalPages > 1 && posts.page && (
          <Pagination page={posts.page} totalPages={posts.totalPages} />
        )}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  const fallback = fallbacks.metadata.posts
  const ogImageUrl = ogImagePathForRoute('/posts')

  return {
    ...fallback,
    alternates: {
      canonical: '/posts',
    },
    openGraph: {
      ...fallback.openGraph,
      images: [{ url: ogImageUrl }],
      url: '/posts',
    },
    twitter: {
      card: 'summary_large_image',
      description: fallback.description,
      images: [ogImageUrl],
      title: fallback.title,
    },
  }
}
