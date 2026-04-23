import configPromise from '@payload-config'
import type { Advisor } from '@/payload-types'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import { cache } from 'react'

async function readDraftEnabled(): Promise<boolean> {
  try {
    return (await draftMode()).isEnabled
  } catch {
    return false
  }
}

export const queryAdvisorBySlug = cache(async (slug: string): Promise<Advisor | null> => {
  const draft = await readDraftEnabled()
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'advisors',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    depth: 1,
    where: {
      slug: {
        equals: slug,
      },
    },
  })
  return (result.docs?.[0] as Advisor | undefined) ?? null
})

/** Published-only; used by `generateStaticParams` and sitemap. */
export async function getAllAdvisorSlugParams(): Promise<Array<{ slug: string }>> {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'advisors',
    draft: false,
    limit: 500,
    pagination: false,
    overrideAccess: false,
    depth: 0,
    select: {
      slug: true,
    },
  })
  return (result.docs || [])
    .map((d) => {
      const s = typeof d.slug === 'string' ? d.slug.trim() : ''
      return s ? { slug: s } : null
    })
    .filter((x): x is { slug: string } => x !== null)
}
