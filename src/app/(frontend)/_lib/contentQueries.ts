import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import { cache } from 'react'
import type { Page, Post } from '@/payload-types'

type CollectionSlug = 'posts' | 'pages'

export const decodeSlugParam = (slug: string): string => decodeURIComponent(slug)

export const getCollectionSlugParams = async (
  collection: CollectionSlug,
  options?: {
    excludeSlugs?: string[]
  },
): Promise<Array<{ slug: string }>> => {
  const payload = await getPayload({ config: configPromise })
  const docs = await payload.find({
    collection,
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const excludeSet = new Set(options?.excludeSlugs || [])

  return (docs.docs || [])
    .filter((doc) => typeof doc.slug === 'string' && doc.slug && !excludeSet.has(doc.slug))
    .map((doc) => ({ slug: String(doc.slug) }))
}

const queryPostBySlug = cache(async (slug: string): Promise<Post | null> => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'posts',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return (result.docs?.[0] as Post | undefined) || null
})

const queryPageBySlug = cache(async (slug: string): Promise<Page | null> => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return (result.docs?.[0] as Page | undefined) || null
})

export async function queryCollectionDocBySlug(args: { collection: 'posts'; slug: string }): Promise<Post | null>
export async function queryCollectionDocBySlug(args: { collection: 'pages'; slug: string }): Promise<Page | null>
export async function queryCollectionDocBySlug({
  collection,
  slug,
}: {
  collection: CollectionSlug
  slug: string
}) {
  return collection === 'posts' ? queryPostBySlug(slug) : queryPageBySlug(slug)
}
