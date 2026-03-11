import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import { draftMode } from 'next/headers'
import React from 'react'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from '@/app/(frontend)/[slug]/page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { redirect } from 'next/navigation'
import {
  decodeSlugParam,
  getCollectionSlugParams,
  queryCollectionDocBySlug,
} from '@/app/(frontend)/_lib/contentQueries'

export async function generateStaticParams() {
  return getCollectionSlugParams('pages', { excludeSlugs: ['home'] })
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = 'home' } = await paramsPromise
  const decodedSlug = decodeSlugParam(slug)
  if (decodedSlug === 'home') redirect('/')

  const url = '/' + decodedSlug
  const page = await queryCollectionDocBySlug({ collection: 'pages', slug: decodedSlug })

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { hero, layout } = page
  const hasHero = Boolean(hero?.type && hero.type !== 'none')

  return (
    <article className="bg-white text-[#0b1035] pb-24">
      <PageClient />
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <RenderHero {...hero} />
      <div className={hasHero ? undefined : 'pt-36 md:pt-40'}>
        <RenderBlocks blocks={layout ?? []} />
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = 'home' } = await paramsPromise
  const decodedSlug = decodeSlugParam(slug)
  const page = await queryCollectionDocBySlug({ collection: 'pages', slug: decodedSlug })

  return generateMeta({ doc: page })
}
