/**
 * Applies hand-curated Lexical content to the benchmark article post (see lib/benchmarkArticleLexicalRoot.ts).
 *
 *   pnpm exec tsx scripts/apply-benchmark-article-content.ts
 */
import dotenv from 'dotenv'
import path from 'node:path'

import {
  getBenchmarkArticleLexicalRoot,
  getBenchmarkArticlePlainForMeta,
} from './lib/benchmarkArticleLexicalRoot'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const SLUG = 'benchmark-constraints-and-goal-based-investing'

function extractMetaDescription(plainText: string): string {
  if (!plainText) return ''
  const singleLine = plainText.replace(/\s+/g, ' ').trim()
  if (singleLine.length <= 220) return singleLine
  return `${singleLine.slice(0, 217).trim()}...`
}

async function main() {
  const [{ default: config }, { getPayload }] = await Promise.all([
    import('@payload-config'),
    import('payload'),
  ])
  const payload = await getPayload({ config })

  const postResult = await payload.find({
    collection: 'posts',
    where: { slug: { equals: SLUG } },
    limit: 1,
    pagination: false,
    depth: 0,
  })
  const post = postResult.docs?.[0]
  if (!post?.id) {
    throw new Error(`Post not found for slug "${SLUG}".`)
  }

  const content = getBenchmarkArticleLexicalRoot()
  const metaDescription = extractMetaDescription(getBenchmarkArticlePlainForMeta())

  const existingMeta =
    post.meta && typeof post.meta === 'object' && !Array.isArray(post.meta)
      ? (post.meta as Record<string, unknown>)
      : {}

  await payload.update({
    collection: 'posts',
    id: post.id,
    depth: 0,
    draft: false,
    data: {
      content,
      meta: {
        ...existingMeta,
        description: metaDescription,
      },
      sourceUpdatedAt: new Date().toISOString(),
    },
    context: { disableRevalidate: true },
  })

  console.log(JSON.stringify({ success: true, slug: SLUG, postId: post.id, metaDescriptionLength: metaDescription.length }, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
