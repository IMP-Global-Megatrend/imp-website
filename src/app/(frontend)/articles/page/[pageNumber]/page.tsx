import type { Metadata } from 'next/types'

import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import articlesContent from '@/constants/articles-content.json'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from '../../../posts/page.client'
import { notFound, redirect } from 'next/navigation'
import { ArticlesAlternatingList } from '../../_components/ArticlesAlternatingList'
import { Breadcrumb } from '../../../_components/Breadcrumb'
import Link from 'next/link'

export const revalidate = 600

const toKebabCase = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

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
    <main className="bg-white text-[#0b1035] pt-24 pb-24">
      <PageClient />
      <div className="container mb-16">
        <div className="prose max-w-none">
          <h1>{articlesContent.heading}</h1>
        </div>
      </div>

      <div className="container pt-8 mb-4">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Articles', href: '/articles' },
            { label: `Page ${sanitizedPageNumber}` },
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

      <ArticlesAlternatingList posts={posts.docs} startIndex={(sanitizedPageNumber - 1) * 12} />

      <div className="container pt-6 md:pt-8">
        <div className="mb-8">
          <PageRange
            collectionLabels={{ plural: 'Articles', singular: 'Article' }}
            currentPage={posts.page}
            limit={12}
            totalDocs={posts.totalDocs}
          />
        </div>
        {posts?.page && posts?.totalPages > 1 && (
          <Pagination basePath="/articles" page={posts.page} totalPages={posts.totalPages} />
        )}
      </div>
    </main>
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
