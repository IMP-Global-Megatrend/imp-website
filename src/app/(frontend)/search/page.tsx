import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { Search } from '@/search/Component'
import PageClient from '@/app/(frontend)/search/page.client'
import { CardPostData } from '@/components/Card'
import fallbacks from '@/constants/fallbacks.json'
import searchContent from '@/constants/search-content.json'
import { ogImagePathForRoute } from '@/utilities/ogImage'

type Args = {
  searchParams: Promise<{
    q: string
  }>
}
export default async function Page({ searchParams: searchParamsPromise }: Args) {
  const { q: query } = await searchParamsPromise
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'search',
    depth: 1,
    limit: 12,
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
    },
    // pagination: false reduces overhead if you don't need totalDocs
    pagination: false,
    ...(query
      ? {
          where: {
            or: [
              {
                title: {
                  like: query,
                },
              },
              {
                'meta.description': {
                  like: query,
                },
              },
              {
                'meta.title': {
                  like: query,
                },
              },
              {
                slug: {
                  like: query,
                },
              },
            ],
          },
        }
      : {}),
  })

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none text-center">
          <h1 className="mb-8 lg:mb-16">{searchContent.heading}</h1>

          <div className="max-w-[50rem] mx-auto">
            <Search />
          </div>
        </div>
      </div>

      {posts.totalDocs > 0 ? (
        <CollectionArchive posts={posts.docs as CardPostData[]} />
      ) : (
        <div className="container">{searchContent.noResults}</div>
      )}
    </div>
  )
}

export function generateMetadata(): Metadata {
  const fallback = fallbacks.metadata.search
  const ogImageUrl = ogImagePathForRoute('/search')

  return {
    ...fallback,
    alternates: {
      canonical: '/search',
    },
    robots: {
      follow: true,
      index: false,
      googleBot: {
        follow: true,
        index: false,
      },
    },
    twitter: {
      card: 'summary_large_image',
      description: fallback.description,
      images: [ogImageUrl],
      title: fallback.title,
    },
    openGraph: {
      ...fallback.openGraph,
      images: [{ url: ogImageUrl }],
      url: '/search',
    },
  }
}
