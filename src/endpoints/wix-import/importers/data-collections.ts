import type { Payload } from 'payload'
import type { ImportEntityResult, ImportIdMap, WixDataItem } from '../types'
import { importMediaBatch } from './media'
import { normalizeWixDataFields, sanitizeWixRawData } from '../normalize-data'

function isLikelyAssetUrl(value: string): boolean {
  try {
    const url = new URL(value)
    const host = url.hostname.toLowerCase()
    const path = url.pathname.toLowerCase()

    const isWixHost =
      host.includes('wixstatic.com') || host.includes('parastorage.com') || host.includes('wixmp.com')
    if (!isWixHost) return false

    return (
      path.includes('/media/') ||
      path.includes('/files/') ||
      /\.(png|jpe?g|webp|gif|svg|avif|bmp|ico|mp4|mov|webm|m4v|mp3|wav|pdf|docx?|xlsx?|pptx?|zip)$/i.test(
        path,
      )
    )
  } catch {
    return false
  }
}

function collectAssetUrls(value: unknown, out: Set<string>): void {
  if (value == null) return

  if (typeof value === 'string') {
    const candidate = value.trim()
    if (!candidate) return

    if (candidate.startsWith('wix:image://') || candidate.startsWith('wix:document://')) {
      out.add(candidate)
      return
    }

    if (candidate.startsWith('http://') || candidate.startsWith('https://')) {
      if (isLikelyAssetUrl(candidate)) out.add(candidate)
      return
    }

    return
  }

  if (Array.isArray(value)) {
    for (const entry of value) collectAssetUrls(entry, out)
    return
  }

  if (typeof value === 'object') {
    for (const entry of Object.values(value as Record<string, unknown>)) {
      collectAssetUrls(entry, out)
    }
  }
}

export async function importDataCollectionItems(
  payload: Payload,
  collectionId: string,
  targetCollection: Parameters<typeof payload.find>[0]['collection'],
  wixItems: WixDataItem[],
  options?: {
    skipExisting?: boolean
    upsertByWixId?: boolean
    dryRun?: boolean
    idMap?: ImportIdMap
    mediaResult?: ImportEntityResult
  },
): Promise<ImportEntityResult> {
  const result: ImportEntityResult = { created: 0, updated: 0, skipped: 0, errors: [] }

  const assetUrls = new Set<string>()
  for (const item of wixItems) {
    collectAssetUrls(item.data, assetUrls)
  }
  if (assetUrls.size > 0) {
    payload.logger.info(`  Found ${assetUrls.size} asset URLs in "${collectionId}"`)
    const mediaBatchResult = await importMediaBatch(payload, [...assetUrls], {
      skipExisting: options?.skipExisting,
      dryRun: options?.dryRun,
      idMap: options?.idMap,
      concurrency: 5,
    })
    if (options?.mediaResult) {
      mergeEntityResult(options.mediaResult, mediaBatchResult)
    }
  }

  for (const item of wixItems) {
    try {
      const existing = await payload.find({
        collection: targetCollection,
        where: {
          sourceItemId: { equals: item.id },
        },
        limit: 1,
        depth: 0,
      })

      const existingDoc = existing.docs[0]
      const sanitizedData = sanitizeWixRawData(item.data)
      const normalizedFields = normalizeWixDataFields(sanitizedData)
      if (existingDoc) {
        if (options?.upsertByWixId) {
          if (!options?.dryRun) {
            await payload.update({
              collection: targetCollection,
              id: existingDoc.id,
              data: {
                sourceCollectionId: collectionId,
                sourceItemId: item.id,
                sourceUpdatedAt: item._updatedDate || item._createdDate || null,
                ...normalizedFields,
                data: sanitizedData,
              },
              depth: 0,
              context: { disableRevalidate: true },
            } as unknown as Parameters<typeof payload.update>[0])
          }
          result.updated++
          continue
        }

        if (options?.skipExisting) {
          result.skipped++
          continue
        }
      }

      if (!options?.dryRun) {
        await payload.create({
          collection: targetCollection,
          data: {
            sourceCollectionId: collectionId,
            sourceItemId: item.id,
            sourceUpdatedAt: item._updatedDate || item._createdDate || null,
            ...normalizedFields,
            data: sanitizedData,
          },
          depth: 0,
          context: { disableRevalidate: true },
        } as unknown as Parameters<typeof payload.create>[0])
      }
      result.created++
    } catch (error) {
      result.errors.push(
        `Failed to import Wix data collection item "${collectionId}:${item.id}": ${error}`,
      )
    }
  }

  payload.logger.info(
    `  Data collection "${collectionId}": ${result.created} created, ${result.updated} updated, ${result.skipped} skipped`,
  )

  return result
}

function mergeEntityResult(target: ImportEntityResult, source: ImportEntityResult): void {
  target.created += source.created
  target.updated += source.updated
  target.skipped += source.skipped
  target.errors.push(...source.errors)
}
