import type { Payload } from 'payload'
import type { WixBlogPost, ImportEntityResult, ImportIdMap } from '@/endpoints/wix-import/types'
import {
  wixRichContentToLexical,
  plainTextToLexical,
  extractImagesFromRichContent,
  resolveWixImageUrl,
} from '@/endpoints/wix-import/converters/rich-text'
import { importMediaByUrl, importMediaBatch } from '@/endpoints/wix-import/importers/media'

function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * Extracts SEO metadata from Wix post data.
 */
function extractSeoMeta(post: WixBlogPost): { title?: string; description?: string } {
  const meta: { title?: string; description?: string } = {}

  if (post.seoData?.tags) {
    for (const tag of post.seoData.tags) {
      if (tag.type === 'title' && tag.children) {
        meta.title = tag.children
      }
      if (tag.type === 'meta' && tag.props?.name === 'description' && tag.props?.content) {
        meta.description = tag.props.content
      }
    }
  }

  if (!meta.title) meta.title = post.title
  if (!meta.description && post.excerpt) meta.description = post.excerpt

  return meta
}

/**
 * Imports Wix blog posts into the Payload posts collection.
 * Handles rich text conversion, media import, and category mapping.
 */
export async function importPosts(
  payload: Payload,
  wixPosts: WixBlogPost[],
  options?: {
    skipExisting?: boolean
    upsertByWixId?: boolean
    dryRun?: boolean
    publishOnImport?: boolean
    idMap?: ImportIdMap
    mediaResult?: ImportEntityResult
  },
): Promise<ImportEntityResult> {
  const result: ImportEntityResult = { created: 0, updated: 0, skipped: 0, errors: [] }
  const idMap = options?.idMap ?? {
    categories: new Map(),
    media: new Map(),
    posts: new Map(),
    pages: new Map(),
  }

  // Pre-download all images from posts' rich content
  const allImageUrls: string[] = []
  for (const post of wixPosts) {
    if (post.richContent) {
      allImageUrls.push(...extractImagesFromRichContent(post.richContent))
    }
    if (post.coverImage?.url) {
      allImageUrls.push(post.coverImage.url)
    }
    if (post.heroImage?.url) {
      allImageUrls.push(post.heroImage.url)
    }
  }

  if (allImageUrls.length > 0) {
    payload.logger.info(`  Pre-downloading ${allImageUrls.length} images from posts...`)
    const mediaBatchResult = await importMediaBatch(payload, allImageUrls, {
      skipExisting: options?.skipExisting,
      dryRun: options?.dryRun,
      idMap,
      concurrency: 5,
    })
    if (options?.mediaResult) {
      mergeEntityResult(options.mediaResult, mediaBatchResult)
    }
  }

  for (const post of wixPosts) {
    try {
      const slug = post.slug || toKebabCase(post.title)

      let existingByWixId: { docs?: Array<{ id: number | string }> } | null = null
      if (options?.upsertByWixId) {
        existingByWixId = await payload.find({
          collection: 'posts',
          where: { sourceId: { equals: post.id } },
          limit: 1,
          depth: 0,
        })
      }

      const existingBySlug = await payload.find({
        collection: 'posts',
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 0,
      })
      const existingDoc = existingByWixId?.docs?.[0] || existingBySlug.docs[0]

      if (existingDoc && !options?.upsertByWixId && options?.skipExisting) {
        idMap.posts.set(post.id, existingDoc.id)
        result.skipped++
        payload.logger.info(`  Skipping existing post: ${post.title}`)
        continue
      }

      // Convert rich content to Lexical
      let content
      if (post.richContent) {
        content = wixRichContentToLexical(post.richContent, {
          resolveMediaId: (url) => idMap.media.get(url) ?? null,
          onUnresolvedMedia: (url) => {
            payload.logger.warn(`  Unresolved post inline media URL: ${url}`)
          },
        })
      } else if (post.plainContent) {
        content = plainTextToLexical(post.plainContent)
      } else {
        content = plainTextToLexical('')
      }

      // Resolve hero/cover image
      let heroImageId: number | string | null = null
      const coverUrl =
        post.coverImage?.url || post.heroImage?.url
      if (coverUrl) {
        const resolved = resolveWixImageUrl(coverUrl)
        heroImageId = idMap.media.get(resolved) ?? null

        if (!heroImageId) {
          heroImageId = await importMediaByUrl(payload, coverUrl, {
            alt: post.title,
            skipExisting: options?.skipExisting,
            dryRun: options?.dryRun,
            idMap,
          })
        }
      }

      // Map Wix category IDs to Payload category IDs
      const categoryIds: (number | string)[] = []
      if (post.categoryIds?.length) {
        for (const wixCatId of post.categoryIds) {
          const payloadCatId = idMap.categories.get(wixCatId)
          if (payloadCatId) categoryIds.push(payloadCatId)
        }
      }

      // Extract SEO data
      const seo = extractSeoMeta(post)

      const postData: Record<string, unknown> = {
        title: post.title,
        slug,
        sourceId: post.id,
        sourceUpdatedAt: post.editedDate || post.lastPublishedDate || post.publishedDate || null,
        content,
        publishedAt: post.firstPublishedDate || post.publishedDate || new Date().toISOString(),
        meta: {
          title: seo.title,
          description: seo.description,
        },
      }

      if (heroImageId) {
        postData.heroImage = heroImageId
      }

      if (categoryIds.length > 0) {
        postData.categories = categoryIds
      }

      if (existingDoc && options?.upsertByWixId) {
        if (!options?.dryRun) {
          await payload.update({
            collection: 'posts',
            id: existingDoc.id,
            draft: !options?.publishOnImport,
            data: {
              ...postData,
              _status: options?.publishOnImport ? 'published' : 'draft',
            },
            depth: 0,
            context: { disableRevalidate: true },
          } as unknown as Parameters<typeof payload.update>[0])
        }
        idMap.posts.set(post.id, existingDoc.id)
        result.updated++
        payload.logger.info(`  Updated post: ${post.title}`)
      } else {
        const doc = options?.dryRun
          ? { id: `dry-run:${post.id}` }
          : await payload.create({
              collection: 'posts',
              draft: !options?.publishOnImport,
              data: {
                ...postData,
                _status: options?.publishOnImport ? 'published' : 'draft',
              },
              depth: 0,
              context: { disableRevalidate: true },
            } as unknown as Parameters<typeof payload.create>[0])

        idMap.posts.set(post.id, doc.id)
        result.created++
        payload.logger.info(`  Created post: ${post.title}`)
      }
    } catch (error) {
      const msg = `Failed to import post "${post.title}": ${error}`
      result.errors.push(msg)
      payload.logger.error(msg)
    }
  }

  return result
}

function mergeEntityResult(target: ImportEntityResult, source: ImportEntityResult): void {
  target.created += source.created
  target.updated += source.updated
  target.skipped += source.skipped
  target.errors.push(...source.errors)
}
