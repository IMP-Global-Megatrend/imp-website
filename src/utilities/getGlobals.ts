import type { Config } from 'src/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

type Global = keyof Config['globals']

type FindGlobalSelectArg = NonNullable<
  Parameters<Awaited<ReturnType<typeof getPayload>>['findGlobal']>[0]['select']
>

async function getGlobal(slug: Global, depth = 0, select?: FindGlobalSelectArg) {
  const payload = await getPayload({ config: configPromise })

  return payload.findGlobal({
    slug,
    depth,
    ...(select ? { select } : {}),
  })
}

/**
 * Returns a unstable_cache function mapped with the cache tag for the slug.
 * Pass `select` to limit fields (avoids heavy / failing joins when only part of the global is needed).
 */
export const getCachedGlobal = (slug: Global, depth = 0, select?: FindGlobalSelectArg) =>
  unstable_cache(async () => getGlobal(slug, depth, select), [slug, String(depth), JSON.stringify(select ?? null)], {
    tags: [`global_${slug}`],
  })
