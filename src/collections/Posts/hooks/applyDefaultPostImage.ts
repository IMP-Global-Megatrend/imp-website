import type { CollectionBeforeValidateHook } from 'payload'

type MaybeRelation = number | string | { id?: number | string } | null | undefined

function relationId(value: MaybeRelation): number | string | null {
  if (!value) return null
  if (typeof value === 'object') return value.id ?? null
  return value
}

function pickPostImageId(post: unknown): number | string | null {
  if (!post || typeof post !== 'object') return null
  const heroImage = relationId((post as { heroImage?: MaybeRelation }).heroImage)
  if (heroImage) return heroImage

  const metaImage = relationId(
    (post as { meta?: { image?: MaybeRelation } }).meta?.image,
  )
  return metaImage || null
}

export const applyDefaultPostImage: CollectionBeforeValidateHook = async ({
  data,
  originalDoc,
  req: { payload },
}) => {
  if (!data || typeof data !== 'object') return data

  const currentHero = relationId((data as { heroImage?: MaybeRelation }).heroImage) ||
    relationId((originalDoc as { heroImage?: MaybeRelation } | undefined)?.heroImage)

  const currentMetaImage = relationId((data as { meta?: { image?: MaybeRelation } }).meta?.image) ||
    relationId((originalDoc as { meta?: { image?: MaybeRelation } } | undefined)?.meta?.image)

  if (currentHero && currentMetaImage) return data

  const latestPublished = await payload.find({
    collection: 'posts',
    where: {
      _status: {
        equals: 'published',
      },
    },
    sort: '-publishedAt',
    limit: 50,
    pagination: false,
    depth: 0,
    overrideAccess: true,
  })

  let fallbackImageId: number | string | null = null
  const currentDocId =
    typeof (originalDoc as { id?: number | string } | undefined)?.id !== 'undefined'
      ? (originalDoc as { id?: number | string }).id
      : null

  for (const post of latestPublished.docs || []) {
    if (currentDocId && post.id === currentDocId) continue
    const candidate = pickPostImageId(post)
    if (candidate) {
      fallbackImageId = candidate
      break
    }
  }

  if (!fallbackImageId) return data

  const nextData = { ...(data as Record<string, unknown>) }
  if (!currentHero) {
    nextData.heroImage = fallbackImageId
  }

  const mergedMeta = {
    ...((originalDoc as { meta?: Record<string, unknown> } | undefined)?.meta || {}),
    ...((data as { meta?: Record<string, unknown> }).meta || {}),
  }
  if (!relationId((mergedMeta as { image?: MaybeRelation }).image)) {
    mergedMeta.image = currentHero || fallbackImageId
    nextData.meta = mergedMeta
  }

  return nextData
}
