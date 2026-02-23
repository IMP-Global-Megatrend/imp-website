import type { Payload } from 'payload'
import type { WixImportOptions, WixImportResult, ImportIdMap } from './types'
import { createWixClient } from './wix-client'
import { importCategories } from './importers/categories'
import { importPosts } from './importers/posts'

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
    skipExisting = true,
    publishOnImport = true,
    limit,
    offset,
  } = options

  const result: WixImportResult = {
    categories: { created: 0, skipped: 0, errors: [] },
    media: { created: 0, skipped: 0, errors: [] },
    posts: { created: 0, skipped: 0, errors: [] },
    dataCollections: { created: 0, skipped: 0, errors: [] },
  }

  const idMap: ImportIdMap = {
    categories: new Map(),
    media: new Map(),
    posts: new Map(),
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
        publishOnImport,
        idMap,
      })
      result.posts = postResult
    } catch (error) {
      const msg = `Failed to fetch/import posts: ${error}`
      result.posts.errors.push(msg)
      payload.logger.error(msg)
    }
  }

  // Step 3: Import Wix Data Collections (CMS items)
  if (options.dataCollections?.length) {
    for (const collectionId of options.dataCollections) {
      payload.logger.info(`Fetching Wix data collection: ${collectionId}...`)
      try {
        const items = await wix.getAllDataCollectionItems(collectionId, { limit })
        payload.logger.info(`Found ${items.length} items in collection "${collectionId}"`)

        // Data collection items are stored as generic key-value data.
        // Users should extend this section to map specific Wix collections
        // to their Payload collections based on their data model.
        for (const item of items) {
          payload.logger.info(
            `  [${collectionId}] Item ${item.id}: ${JSON.stringify(item.data).substring(0, 100)}...`,
          )
          result.dataCollections.created++
        }

        payload.logger.info(
          `  Note: Data collection "${collectionId}" items are logged but not yet mapped to Payload collections. ` +
            `Extend the importers to handle your specific data model.`,
        )
      } catch (error) {
        const msg = `Failed to fetch data collection "${collectionId}": ${error}`
        result.dataCollections.errors.push(msg)
        payload.logger.error(msg)
      }
    }
  }

  // Log summary
  payload.logger.info('=== Wix Import Complete ===')
  payload.logger.info(`Categories: ${result.categories.created} created, ${result.categories.skipped} skipped, ${result.categories.errors.length} errors`)
  payload.logger.info(`Posts: ${result.posts.created} created, ${result.posts.skipped} skipped, ${result.posts.errors.length} errors`)
  if (options.dataCollections?.length) {
    payload.logger.info(`Data Collections: ${result.dataCollections.created} items found, ${result.dataCollections.errors.length} errors`)
  }

  return result
}
