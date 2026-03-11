import type { Payload } from 'payload'
import type { WixImportOptions, WixImportResult, ImportIdMap, ImportEntityResult } from '@/endpoints/wix-import/types'
import { createWixClient } from '@/endpoints/wix-import/source-client'
import { importCategories } from '@/endpoints/wix-import/importers/categories'
import { importPosts } from '@/endpoints/wix-import/importers/posts'
import { importPages } from '@/endpoints/wix-import/importers/pages'
import { importDataCollectionItems } from '@/endpoints/wix-import/importers/data-collections'
import { wixCollectionSlugById } from '@/collections/SourceCollections'

/**
 * Main Wix data import orchestrator.
 *
 * Fetches content from the Wix Blog and Data APIs and imports it
 * into Payload CMS collections:
 *   - Blog categories → categories
 *   - Blog post images → media
 *   - Blog posts → posts (with Lexical rich text)
 *
 * Usage:
 *   1. Set WIX_API_KEY, WIX_SITE_ID, WIX_ACCOUNT_ID in .env
 *   2. Call via POST /next/wix-import (requires authentication)
 *   3. Or invoke directly: await wixImport({ payload, options })
 */
export async function wixImport({
  payload,
  options = {},
}: {
  payload: Payload
  options?: WixImportOptions
}): Promise<WixImportResult> {
  const {
    posts: importPostsEnabled = true,
    categories: importCategoriesEnabled = true,
    pages: importPagesEnabled = true,
    skipExisting = true,
    upsertByWixId = true,
    dryRun = false,
    publishOnImport = true,
    limit,
    offset,
  } = options

  const result: WixImportResult = {
    categories: { created: 0, updated: 0, skipped: 0, errors: [] },
    media: { created: 0, updated: 0, skipped: 0, errors: [] },
    posts: { created: 0, updated: 0, skipped: 0, errors: [] },
    pages: { created: 0, updated: 0, skipped: 0, errors: [] },
    dataCollections: { created: 0, updated: 0, skipped: 0, errors: [] },
  }

  const idMap: ImportIdMap = {
    categories: new Map(),
    media: new Map(),
    posts: new Map(),
    pages: new Map(),
  }

  payload.logger.info('=== Starting Wix Data Import ===')

  const wix = createWixClient()

  // Step 1: Import categories
  if (importCategoriesEnabled) {
    payload.logger.info('Fetching Wix blog categories...')
    try {
      const wixCategories = await wix.getAllBlogCategories()
      payload.logger.info(`Found ${wixCategories.length} categories`)

      const catResult = await importCategories(payload, wixCategories, {
        skipExisting,
        upsertByWixId,
        dryRun,
        idMap,
      })
      result.categories = catResult
    } catch (error) {
      const msg = `Failed to fetch/import categories: ${error}`
      result.categories.errors.push(msg)
      payload.logger.error(msg)
    }
  }

  // Step 2: Import blog posts (media is imported inline as part of posts)
  if (importPostsEnabled) {
    payload.logger.info('Fetching Wix blog posts...')
    try {
      const wixPosts = await wix.getAllBlogPosts({ limit, offset })
      payload.logger.info(`Found ${wixPosts.length} posts`)

      const postResult = await importPosts(payload, wixPosts, {
        skipExisting,
        upsertByWixId,
        dryRun,
        publishOnImport,
        idMap,
        mediaResult: result.media,
      })
      result.posts = postResult
    } catch (error) {
      const msg = `Failed to fetch/import posts: ${error}`
      result.posts.errors.push(msg)
      payload.logger.error(msg)
    }
  }

  // Step 3: Import site pages
  if (importPagesEnabled) {
    payload.logger.info('Fetching Wix site pages...')
    try {
      const wixPages = await wix.getAllSitePages({ limit, offset })
      payload.logger.info(`Found ${wixPages.length} pages`)

      const pageResult = await importPages(payload, wixPages, {
        skipExisting,
        upsertByWixId,
        dryRun,
        publishOnImport,
        idMap,
        mediaResult: result.media,
      })
      result.pages = pageResult
    } catch (error) {
      const msg = `Failed to fetch/import pages: ${error}`
      result.pages.errors.push(msg)
      payload.logger.error(msg)
    }
  }

  // Step 4: Import Wix Data Collections (CMS items)
  if (options.dataCollections?.length) {
    for (const collectionId of options.dataCollections) {
      payload.logger.info(`Fetching Wix data collection: ${collectionId}...`)
      try {
        const targetCollection = wixCollectionSlugById[collectionId]
        if (!targetCollection) {
          const msg = `No Payload collection mapping exists for Wix collection "${collectionId}".`
          result.dataCollections.errors.push(msg)
          payload.logger.error(msg)
          continue
        }

        const items = await wix.getAllDataCollectionItems(collectionId, { limit })
        payload.logger.info(`Found ${items.length} items in collection "${collectionId}"`)
        const collectionResult = await importDataCollectionItems(
          payload,
          collectionId,
          targetCollection as Parameters<typeof payload.find>[0]['collection'],
          items,
          {
          skipExisting,
          upsertByWixId,
          dryRun,
          idMap,
          mediaResult: result.media,
          },
        )
        mergeEntityResult(result.dataCollections, collectionResult)
      } catch (error) {
        const msg = `Failed to fetch data collection "${collectionId}": ${error}`
        result.dataCollections.errors.push(msg)
        payload.logger.error(msg)
      }
    }
  }

  // Log summary
  payload.logger.info('=== Wix Import Complete ===')
  payload.logger.info(formatResultSummary('Categories', result.categories))
  payload.logger.info(formatResultSummary('Posts', result.posts))
  payload.logger.info(formatResultSummary('Pages', result.pages))
  payload.logger.info(formatResultSummary('Media', result.media))
  if (options.dataCollections?.length) {
    payload.logger.info(formatResultSummary('Data Collections', result.dataCollections))
  }

  return result
}

function mergeEntityResult(target: ImportEntityResult, source: ImportEntityResult): void {
  target.created += source.created
  target.updated += source.updated
  target.skipped += source.skipped
  target.errors.push(...source.errors)
}

function formatResultSummary(label: string, value: ImportEntityResult): string {
  return `${label}: ${value.created} created, ${value.updated} updated, ${value.skipped} skipped, ${value.errors.length} errors`
}
