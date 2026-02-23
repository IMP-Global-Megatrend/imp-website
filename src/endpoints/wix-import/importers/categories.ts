import type { Payload } from 'payload'
import type { WixBlogCategory, ImportIdMap } from '../types'

function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * Imports Wix blog categories into the Payload categories collection.
 */
export async function importCategories(
  payload: Payload,
  wixCategories: WixBlogCategory[],
  options?: {
    skipExisting?: boolean
    idMap?: ImportIdMap
  },
): Promise<{ created: number; skipped: number; errors: string[] }> {
  const result = { created: 0, skipped: 0, errors: [] as string[] }

  for (const wixCat of wixCategories) {
    try {
      const slug = wixCat.slug || toKebabCase(wixCat.label || wixCat.title || wixCat.id)
      const title = wixCat.label || wixCat.title || slug

      if (options?.skipExisting) {
        const existing = await payload.find({
          collection: 'categories',
          where: { slug: { equals: slug } },
          limit: 1,
          depth: 0,
        })

        if (existing.docs.length > 0) {
          options.idMap?.categories.set(wixCat.id, existing.docs[0].id)
          result.skipped++
          payload.logger.info(`  Skipping existing category: ${title}`)
          continue
        }
      }

      const doc = await payload.create({
        collection: 'categories',
        data: {
          title,
          slug,
        },
        depth: 0,
        context: { disableRevalidate: true },
      })

      options?.idMap?.categories.set(wixCat.id, doc.id)
      result.created++
      payload.logger.info(`  Created category: ${title}`)
    } catch (error) {
      const msg = `Failed to import category "${wixCat.label || wixCat.id}": ${error}`
      result.errors.push(msg)
      payload.logger.error(msg)
    }
  }

  return result
}
