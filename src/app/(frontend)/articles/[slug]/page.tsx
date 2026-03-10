import type { Metadata } from 'next'

import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import RichText from '@/components/RichText'

import type { Post } from '@/payload-types'

import { generateMeta } from '@/utilities/generateMeta'
import PageClient from '../../posts/page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { formatAuthors } from '@/utilities/formatAuthors'
import { PageHero } from '../../_components/PageHero'
import { Breadcrumb } from '../../_components/Breadcrumb'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'posts',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = posts.docs.map(({ slug }) => {
    return { slug }
  })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

const formatOverviewStyleDate = (value?: string | null): string => {
  if (!value) return ''
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''
  const day = parsed.getDate()
  const month = parsed.toLocaleString('en-US', { month: 'long' })
  const year = parsed.getFullYear()
  return `${day}th of ${month} ${year}`
}

export default async function Article({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const url = '/articles/' + decodedSlug
  const post = await queryPostBySlug({ slug: decodedSlug })

  if (!post) return <PayloadRedirects url={url} />
  const paletteSource =
    (post as unknown as { articleHeroPalette?: Record<string, unknown> }).articleHeroPalette || {}
  const heroPalette = {
    color1: typeof paletteSource.color1 === 'string' ? paletteSource.color1 : '#2b3dea',
    color2:
      typeof paletteSource.color2 === 'string' ? paletteSource.color2 : 'oklch(0.47 0.12 174)',
    color3:
      typeof paletteSource.color3 === 'string' ? paletteSource.color3 : 'oklch(0.47 0.10 136)',
  }
  const heroSubtitle = post.meta?.description || undefined

  return (
    <main className="bg-white text-[#0b1035]">
      <PageClient />
      <PayloadRedirects disableNotFound url={url} />
      {draft && <LivePreviewListener />}

      <PageHero
        title={post.title}
        subtitle={heroSubtitle}
        palette={heroPalette}
      />

      <div className="container py-16 md:py-20 max-w-4xl">
        <div className="mx-auto max-w-[48rem] mb-6 text-[#2b3045]">
          <div className="mb-4">
            <Breadcrumb
              items={[
                { label: 'Home', href: '/' },
                { label: 'Articles', href: '/articles' },
                { label: post.title || 'Article' },
              ]}
              textClassName="text-[16px] md:text-[17px]"
            />
          </div>
          <div className="flex flex-col md:flex-row gap-4 md:gap-16">
            {post.populatedAuthors && post.populatedAuthors.length > 0 && (
              <div className="flex flex-col gap-1">
                <p className="text-sm text-[#5f6477]">Author</p>
                <p>{formatAuthors(post.populatedAuthors)}</p>
              </div>
            )}
            {post.publishedAt && (
              <div className="flex flex-col gap-1">
                <p className="text-sm text-[#5f6477]">Date Published</p>
                <time dateTime={post.publishedAt}>{formatOverviewStyleDate(post.publishedAt)}</time>
              </div>
            )}
          </div>
        </div>
        <RichText
          className="mx-auto max-w-[48rem] prose md:prose-md text-[#2b3045] prose-headings:text-[#0b1035] prose-strong:text-[#0b1035] prose-li:text-[#2b3045] prose-a:text-[#2b3dea] prose-a:no-underline hover:prose-a:text-[#1f2ecf]"
          data={post.content}
          enableProse={false}
          enableGutter={false}
        />
        {post.relatedPosts && post.relatedPosts.length > 0 && (
          <RelatedPosts
            className="mt-12 max-w-[52rem] lg:grid lg:grid-cols-subgrid col-start-1 col-span-3 grid-rows-[2fr]"
            docs={post.relatedPosts.filter((post) => typeof post === 'object')}
          />
        )}
      </div>
    </main>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const post = await queryPostBySlug({ slug: decodedSlug })

  return generateMeta({ doc: post, postPathPrefix: '/articles' })
}

const queryPostBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
