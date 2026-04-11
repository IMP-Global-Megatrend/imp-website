import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import { cache } from 'react'
import type { Page, Post } from '@/payload-types'

type CollectionSlug = 'posts' | 'pages'

/** draftMode() can throw outside a request (static prerender / some workers); match prior home-shell behavior. */
async function readDraftEnabled(): Promise<boolean> {
  try {
    return (await draftMode()).isEnabled
  } catch {
    return false
  }
}

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
  const draft = await readDraftEnabled()
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

/** Same contract as other routes (`[slug]`), with optional `depth` for the home shell (upload IDs at depth 0). */
export const queryPageBySlug = cache(async (slug: string, depth?: number): Promise<Page | null> => {
  const draft = await readDraftEnabled()
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    ...(depth !== undefined ? { depth } : {}),
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
