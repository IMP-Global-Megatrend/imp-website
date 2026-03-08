import type { Payload } from 'payload'
import type { WixBlogCategory, ImportEntityResult, ImportIdMap } from '../types'

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
    upsertByWixId?: boolean
    dryRun?: boolean
    idMap?: ImportIdMap
  },
): Promise<ImportEntityResult> {
  const result: ImportEntityResult = { created: 0, updated: 0, skipped: 0, errors: [] }

  for (const wixCat of wixCategories) {
    try {
      const slug = wixCat.slug || toKebabCase(wixCat.label || wixCat.title || wixCat.id)
      const title = wixCat.label || wixCat.title || slug

      let existingByWixId: { docs?: Array<{ id: number | string }> } | null = null

      if (options?.upsertByWixId) {
        existingByWixId = await payload.find({
          collection: 'categories',
          where: { sourceId: { equals: wixCat.id } },
          limit: 1,
          depth: 0,
        })
      }

      const existingBySlug = await payload.find({
        collection: 'categories',
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 0,
      })

      const existingDoc = existingByWixId?.docs?.[0] || existingBySlug.docs[0]
      if (existingDoc) {
        options?.idMap?.categories.set(wixCat.id, existingDoc.id)

        if (options?.upsertByWixId) {
          if (!options.dryRun) {
            await payload.update({
              collection: 'categories',
              id: existingDoc.id,
              data: {
                title,
                slug,
                sourceId: wixCat.id,
              },
              depth: 0,
              context: { disableRevalidate: true },
            })
          }
          result.updated++
          payload.logger.info(`  Updated category: ${title}`)
          continue
        }

        if (options?.skipExisting) {
          result.skipped++
          payload.logger.info(`  Skipping existing category: ${title}`)
          continue
        }
      }

      const doc = options?.dryRun
        ? { id: `dry-run:${wixCat.id}` }
        : await payload.create({
            collection: 'categories',
            data: {
              title,
              slug,
              sourceId: wixCat.id,
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
