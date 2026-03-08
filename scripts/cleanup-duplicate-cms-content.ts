// @ts-nocheck
import config from '@payload-config'
import { getPayload } from 'payload'

type CMSDoc = Record<string, unknown>

function getTextFieldValue(doc: CMSDoc, key: string): string {
  const data = (doc.data && typeof doc.data === 'object' ? doc.data : {}) as Record<string, unknown>
  const direct = data[key]
  if (typeof direct === 'string' && direct.trim() !== '') return direct.trim()

  const textFields = Array.isArray(doc.textFields) ? (doc.textFields as Array<Record<string, unknown>>) : []
  const field = textFields.find((entry) => entry?.key === key)
  return typeof field?.value === 'string' ? field.value.trim() : ''
}

function normalizeTitle(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function getUpdatedTimestamp(doc: CMSDoc): number {
  const updatedAt = doc.updatedAt
  if (typeof updatedAt !== 'string') return 0
  const timestamp = Date.parse(updatedAt)
  return Number.isFinite(timestamp) ? timestamp : 0
}

function getCompletenessScore(doc: CMSDoc): number {
  const data = (doc.data && typeof doc.data === 'object' ? doc.data : {}) as Record<string, unknown>
  let score = 0

  for (const value of Object.values(data)) {
    if (typeof value === 'string' && value.trim() !== '') score++
    if (typeof value === 'number' && Number.isFinite(value)) score++
    if (Array.isArray(value) && value.length > 0) score++
    if (typeof value === 'object' && value != null) score++
  }

  const textFields = Array.isArray(doc.textFields) ? doc.textFields : []
  score += textFields.length

  return score
}

function sortKeepFirst(a: CMSDoc, b: CMSDoc): number {
  const byCompleteness = getCompletenessScore(b) - getCompletenessScore(a)
  if (byCompleteness !== 0) return byCompleteness
  return getUpdatedTimestamp(b) - getUpdatedTimestamp(a)
}

async function cleanupCollectionByNormalizedTitle(
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: string,
  titleKey: string,
) {
  const result = await payload.find({
    collection,
    limit: 1000,
    pagination: false,
    depth: 0,
  })

  const docs = (result.docs ?? []) as CMSDoc[]
  const groups = new Map<string, CMSDoc[]>()

  for (const doc of docs) {
    const title = getTextFieldValue(doc, titleKey)
    if (!title) continue

    const normalized = normalizeTitle(title)
    const bucket = groups.get(normalized) ?? []
    bucket.push(doc)
    groups.set(normalized, bucket)
  }

  let deleted = 0
  let duplicateGroups = 0
  const deletedIds: string[] = []

  for (const [normalizedTitle, group] of groups.entries()) {
    if (group.length <= 1) continue
    duplicateGroups++

    const sorted = [...group].sort(sortKeepFirst)
    const [keep, ...toDelete] = sorted
    const rawTitle = getTextFieldValue(keep, titleKey) || normalizedTitle
    payload.logger.info(
      `[cms-cleanup] ${collection} duplicate "${rawTitle}" -> keeping ${String(keep.id)}, deleting ${toDelete.length}`,
    )

    for (const doc of toDelete) {
      await payload.delete({
        collection,
        id: doc.id as string,
        depth: 0,
      })
      deleted++
      deletedIds.push(String(doc.id))
    }
  }

  return { collection, totalDocs: docs.length, duplicateGroups, deleted, deletedIds }
}

async function cleanupCollectionToSingleBest(payload: Awaited<ReturnType<typeof getPayload>>, collection: string) {
  const result = await payload.find({
    collection,
    limit: 1000,
    pagination: false,
    depth: 0,
  })

  const docs = (result.docs ?? []) as CMSDoc[]
  if (docs.length <= 1) {
    return { collection, totalDocs: docs.length, duplicateGroups: 0, deleted: 0, deletedIds: [] as string[] }
  }

  const sorted = [...docs].sort(sortKeepFirst)
  const [keep, ...toDelete] = sorted
  payload.logger.info(
    `[cms-cleanup] ${collection} singleton cleanup -> keeping ${String(keep.id)}, deleting ${toDelete.length}`,
  )

  const deletedIds: string[] = []
  for (const doc of toDelete) {
    await payload.delete({
      collection,
      id: doc.id as string,
      depth: 0,
    })
    deletedIds.push(String(doc.id))
  }

  return {
    collection,
    totalDocs: docs.length,
    duplicateGroups: 1,
    deleted: toDelete.length,
    deletedIds,
  }
}

async function main() {
  const payload = await getPayload({ config })
  const summary = {
    megatrendDataset: await cleanupCollectionByNormalizedTitle(
      payload,
      'wix-megatrend-dataset',
      'title_fld',
    ),
    trustList: await cleanupCollectionByNormalizedTitle(payload, 'wix-trust-list', 'title_fld'),
    fundAttributes: await cleanupCollectionByNormalizedTitle(payload, 'wix-fund-attributes', 'title_fld'),
    homepageLinks: await cleanupCollectionToSingleBest(payload, 'wix-homepage-links'),
    fundDetails: await cleanupCollectionToSingleBest(payload, 'wix-fund-details'),
  }
  payload.logger.info({ summary }, 'CMS duplicate cleanup completed')
  console.log(JSON.stringify(summary, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
