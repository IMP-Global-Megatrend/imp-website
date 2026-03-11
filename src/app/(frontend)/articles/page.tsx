import type { Metadata } from 'next/types'

import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import articlesContent from '@/constants/articles-content.json'
import fallbacks from '@/constants/fallbacks.json'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'
import PageClient from '../posts/page.client'
import { PageHero } from '../_components/PageHero'
import { ArticlesAlternatingList } from './_components/ArticlesAlternatingList'
import { Breadcrumb } from '../_components/Breadcrumb'

export const dynamic = 'force-static'
export const revalidate = 600

const toKebabCase = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

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
  const categoriesResult = await payload.find({
    collection: 'categories',
    limit: 1000,
    pagination: false,
    overrideAccess: false,
    select: {
      id: true,
      title: true,
      slug: true,
    },
  })
  const categoryLinksBase = (categoriesResult.docs || []).reduce<
    Array<{ id: number; title: string; slug: string }>
  >((acc, category) => {
    if (typeof category.id !== 'number') return acc
    const title = typeof category.title === 'string' ? category.title.trim() : ''
    if (!title) return acc
    const slug =
      typeof category.slug === 'string' && category.slug.trim()
        ? category.slug.trim()
        : toKebabCase(title)
    acc.push({ id: category.id, title, slug })
    return acc
  }, [])
  const categoryLinks = (
    await Promise.all(
      categoryLinksBase.map(async (category) => {
        const countResult = await payload.count({
          collection: 'posts',
          overrideAccess: false,
          where: {
            categories: {
              contains: category.id,
            },
          },
        })

        return {
          ...category,
          count: countResult.totalDocs || 0,
        }
      }),
    )
  ).filter((category) => category.count > 0)

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
        {categoryLinks.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 font-display text-[12px] md:text-[13px] uppercase tracking-[0.12em] text-[#5f6477]">
              Categories
            </p>
            <div className="flex flex-wrap gap-2">
              {categoryLinks.map((category) => (
                <Link
                  key={category.slug}
                  href={`/articles/category/${category.slug}`}
                  className="inline-flex items-center rounded-full border border-[#d9def0] bg-[#f4f6fb] px-3 py-1 font-display text-[12px] md:text-[13px] uppercase tracking-[0.08em] text-[#2b3045]"
                >
                  {category.title} ({category.count})
                </Link>
              ))}
            </div>
          </div>
        )}
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
