import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import postsContent from '@/constants/posts-content.json'
import { buildStaticPageParams, parsePositivePageOr404 } from '@/app/(frontend)/_lib/archivePagination'
import { buildPaginatedArchiveMetadata } from '@/app/(frontend)/_lib/archiveMetadata'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from '@/app/(frontend)/posts/page/[pageNumber]/page.client'
import { notFound, redirect } from 'next/navigation'
import { POSTS_ARCHIVE_PAGE_SIZE, POSTS_ARCHIVE_SELECT } from '@/app/(frontend)/posts/_lib/constants'

export const revalidate = 600

type Args = {
  params: Promise<{
    pageNumber: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { pageNumber } = await paramsPromise
  const payload = await getPayload({ config: configPromise })

  const sanitizedPageNumber = parsePositivePageOr404(pageNumber)
  if (sanitizedPageNumber === 1) redirect('/posts')

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: POSTS_ARCHIVE_PAGE_SIZE,
    page: sanitizedPageNumber,
    overrideAccess: false,
    select: POSTS_ARCHIVE_SELECT,
  })
  if (posts.totalDocs > 0 && sanitizedPageNumber > posts.totalPages) notFound()

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
        {posts?.page && posts?.totalPages > 1 && (
          <Pagination page={posts.page} totalPages={posts.totalPages} />
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { pageNumber } = await paramsPromise
  return buildPaginatedArchiveMetadata({
    basePath: '/posts',
    pageNumber,
    titleTemplate: postsContent.pagination.titleTemplate,
    descriptionTemplate: postsContent.pagination.descriptionTemplate,
    openGraphImageUrl: '/images/og/posts-og.png',
  })
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const { totalDocs } = await payload.count({
    collection: 'posts',
    overrideAccess: false,
  })

  return buildStaticPageParams(totalDocs, POSTS_ARCHIVE_PAGE_SIZE)
}
