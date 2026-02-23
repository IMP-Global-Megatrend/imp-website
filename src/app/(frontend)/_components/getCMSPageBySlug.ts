import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'

export async function getCMSPageBySlug(slug: string) {
  // Keep styled hardcoded pages as default until CMS content is modeled 1:1.
  if (process.env.ENABLE_FRONTEND_CMS_PAGES !== 'true') {
    return null
  }

  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: {
      slug: { equals: slug },
    },
  })

  return result.docs?.[0] ?? null
}
