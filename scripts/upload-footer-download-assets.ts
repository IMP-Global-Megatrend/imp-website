import dotenv from 'dotenv'
import path from 'node:path'
import type { File, Payload } from 'payload'
import { createWixClient } from '@/endpoints/wix-import/source-client'
import { resolveWixImageUrl } from '@/endpoints/wix-import/converters/rich-text'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

type DocumentKey = 'factsheetUsd' | 'factsheetChfHedged' | 'fundCommentary' | 'presentation'
type PageSlug = 'home' | 'fund' | 'performance-analysis' | 'megatrends'
type ScalarId = string | number
type MediaId = number

type WixDataItemLike = {
  id: string
  _updatedDate?: string
  _createdDate?: string
  data: Record<string, unknown>
}

const WIX_DOC_COLLECTION = process.env.WIX_DOCUMENTS_COLLECTION_ID || 'Homepagelinks'
const WIX_DOC_LOOKBACK = Number(process.env.WIX_DOCUMENTS_LOOKBACK || '10')

const REQUIRED_DOC_KEYS: DocumentKey[] = [
  'factsheetUsd',
  'factsheetChfHedged',
  'fundCommentary',
  'presentation',
]

const DOC_LABEL: Record<DocumentKey, string> = {
  factsheetUsd: 'Factsheet USD PDF',
  factsheetChfHedged: 'Factsheet CHF Hedged PDF',
  fundCommentary: 'Fund Commentary PDF',
  presentation: 'Presentation PDF',
}

const WIX_FIELD_ALIASES: Record<DocumentKey, string[]> = {
  factsheetUsd: ['factSheet', 'factsheet', 'factsheetUsd', 'factsheetUSD', 'factSheetUsd'],
  factsheetChfHedged: ['factsheetChfHedged', 'factSheetChfHedged', 'factsheetCHFHedged'],
  fundCommentary: ['fundCommentary', 'latestFundCommentary', 'commentary', 'fund_commentary'],
  presentation: ['presentation', 'fundPresentation', 'investorPresentation'],
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function normalizeString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function isSupportedDocumentUrl(value: string): boolean {
  return (
    value.startsWith('wix:document://') ||
    value.startsWith('wix:image://') ||
    (value.startsWith('http://') || value.startsWith('https://'))
  )
}

function extractWixUgdFileId(value: string): string | null {
  const wixTokenMatch = value.match(/wix:document:\/\/v1\/ugd\/([^/?#]+)/)
  if (wixTokenMatch?.[1]) return wixTokenMatch[1]

  const siteUrlMatch = value.match(/\/_files\/ugd\/([^/?#]+)/)
  if (siteUrlMatch?.[1]) return siteUrlMatch[1]

  return null
}

function toStaticWixUgdUrl(value: string): string | null {
  const fileId = extractWixUgdFileId(value)
  if (!fileId) return null
  return `https://static.wixstatic.com/ugd/${fileId}`
}

function normalizeDocumentUrl(raw: string): string {
  const staticUgdUrl = toStaticWixUgdUrl(raw)
  if (staticUgdUrl) return staticUgdUrl

  const resolved = resolveWixImageUrl(raw)
  return resolved.trim()
}

function normalizeLookup(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ')
}

function classifyDocumentKeyByText(text: string): DocumentKey | null {
  const key = normalizeLookup(text)
  if (!key) return null

  const hasFactsheet = key.includes('factsheet') || key.includes('fact sheet')
  if (hasFactsheet && key.includes('chf')) return 'factsheetChfHedged'
  if (hasFactsheet && key.includes('usd')) return 'factsheetUsd'
  if (hasFactsheet && key.includes('hedged')) return 'factsheetChfHedged'
  if (hasFactsheet) return 'factsheetUsd'
  if (key.includes('commentary')) return 'fundCommentary'
  if (key.includes('presentation')) return 'presentation'
  return null
}

function deriveFilename(url: string, fallback: string): string {
  try {
    const pathname = new URL(url).pathname
    const tail = pathname.split('/').pop() || ''
    const clean = tail.split('?')[0]?.trim()
    if (clean) return clean
  } catch {
    // no-op
  }
  return fallback
}

function getContentTypeFromResponse(res: Response, fallback: string): string {
  const fromHeader = res.headers.get('content-type')
  if (fromHeader && fromHeader.trim()) return fromHeader
  return fallback
}

async function fetchFile(url: string, filename: string): Promise<File> {
  let res = await fetch(url, { method: 'GET' })
  let activeUrl = url

  if (!res.ok) {
    const fallbackUrl = toStaticWixUgdUrl(url)
    if (fallbackUrl && fallbackUrl !== url) {
      const fallbackRes = await fetch(fallbackUrl, { method: 'GET' })
      if (fallbackRes.ok) {
        res = fallbackRes
        activeUrl = fallbackUrl
      }
    }
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch ${activeUrl}. Status: ${res.status}`)
  }

  const data = await res.arrayBuffer()
  const outputName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`

  return {
    name: outputName,
    data: Buffer.from(data),
    mimetype: getContentTypeFromResponse(res, 'application/pdf'),
    size: data.byteLength,
  }
}

async function upsertPdfMedia(payload: Payload, item: {
  key: DocumentKey
  label: string
  sourceUrl: string
}): Promise<MediaId> {
  const existing = await payload.find({
    collection: 'media',
    where: {
      sourceUrl: {
        equals: item.sourceUrl,
      },
    },
    limit: 1,
    pagination: false,
    depth: 0,
  })

  const existingDoc = existing.docs?.[0]
  if (existingDoc) {
    // Avoid lock-dependent updates in environments with partial lock-table schemas.
    return existingDoc.id
  }

  const filename = deriveFilename(item.sourceUrl, `${item.key}.pdf`)
  const file = await fetchFile(item.sourceUrl, filename)
  const created = await payload.create({
    collection: 'media',
    data: {
      alt: item.label,
      sourceUrl: item.sourceUrl,
    },
    file,
    depth: 0,
    context: { disableRevalidate: true },
    disableTransaction: true,
  })

  return created.id
}

function extractFromWixDataItem(item: WixDataItemLike): Partial<Record<DocumentKey, string>> {
  const data = isRecord(item.data) ? item.data : {}
  const resolved: Partial<Record<DocumentKey, string>> = {}

  for (const key of REQUIRED_DOC_KEYS) {
    for (const alias of WIX_FIELD_ALIASES[key]) {
      const value = normalizeString(data[alias])
      if (!value || !isSupportedDocumentUrl(value)) continue
      const normalized = normalizeDocumentUrl(value)
      if (!normalized) continue
      resolved[key] = normalized
      break
    }
  }

  for (const [fieldKey, rawValue] of Object.entries(data)) {
    const value = normalizeString(rawValue)
    if (!value || !isSupportedDocumentUrl(value)) continue

    const byField = classifyDocumentKeyByText(fieldKey)
    const byValue = classifyDocumentKeyByText(value)
    const key = byField || byValue
    if (!key || resolved[key]) continue

    const normalized = normalizeDocumentUrl(value)
    if (!normalized) continue
    resolved[key] = normalized
  }

  return resolved
}

async function fetchLatestWixDocumentUrls(payload: Payload): Promise<Record<DocumentKey, string>> {
  const wix = createWixClient()
  const items = await wix.getLatestDataCollectionItems(WIX_DOC_COLLECTION, {
    limit: Math.max(1, WIX_DOC_LOOKBACK),
  })

  if (items.length === 0) {
    throw new Error(`No records found in Wix collection "${WIX_DOC_COLLECTION}".`)
  }

  const docsByKey: Partial<Record<DocumentKey, string>> = {}

  for (const item of items as WixDataItemLike[]) {
    const extracted = extractFromWixDataItem(item)
    for (const key of REQUIRED_DOC_KEYS) {
      if (docsByKey[key] || !extracted[key]) continue
      docsByKey[key] = extracted[key]
      payload.logger.info(
        `[wix-doc-sync] mapped ${key} from Wix item ${item.id} (${item._updatedDate || item._createdDate || 'unknown-date'})`,
      )
    }
  }

  const missing = REQUIRED_DOC_KEYS.filter((key) => !docsByKey[key])
  if (missing.length > 0) {
    throw new Error(
      `Missing required Wix documents for keys: ${missing.join(', ')} in collection "${WIX_DOC_COLLECTION}".`,
    )
  }

  return docsByKey as Record<DocumentKey, string>
}

function docKeyFromLabel(value: unknown): DocumentKey | null {
  const label = normalizeString(value)
  if (!label) return null
  return classifyDocumentKeyByText(label)
}

function mergeTextFieldEntry(
  list: unknown,
  key: string,
  value: string,
): Array<{ key: string; value: string }> {
  const rows = Array.isArray(list)
    ? list
        .map((entry) => {
          if (!isRecord(entry)) return null
          const currentKey = normalizeString(entry.key)
          const currentValue = normalizeString(entry.value)
          if (!currentKey || currentValue == null) return null
          return { key: currentKey, value: currentValue }
        })
        .filter((entry): entry is { key: string; value: string } => Boolean(entry))
    : []

  const idx = rows.findIndex((row) => row.key === key)
  if (idx >= 0) {
    rows[idx] = { key, value }
  } else {
    rows.push({ key, value })
  }
  return rows
}

async function updateHomepagelinksCollection(
  payload: Payload,
  docUrls: Record<DocumentKey, string>,
): Promise<void> {
  const result = await payload.find({
    collection: 'homepage-links',
    limit: 1,
    pagination: false,
    depth: 0,
    sort: '-updatedAt',
  })

  const row = result.docs?.[0] as
    | {
        id: ScalarId
        data?: unknown
        textFields?: unknown
      }
    | undefined

  if (!row) {
    payload.logger.warn('[wix-doc-sync] No homepage-links row found; skipped URL persistence.')
    return
  }

  const data = isRecord(row.data) ? { ...row.data } : {}
  data.factSheet = docUrls.factsheetUsd
  data.factsheetChfHedged = docUrls.factsheetChfHedged
  data.fundCommentary = docUrls.fundCommentary
  data.presentation = docUrls.presentation

  let textFields = mergeTextFieldEntry(row.textFields, 'factSheet', docUrls.factsheetUsd)
  textFields = mergeTextFieldEntry(textFields, 'factsheetChfHedged', docUrls.factsheetChfHedged)
  textFields = mergeTextFieldEntry(textFields, 'fundCommentary', docUrls.fundCommentary)
  textFields = mergeTextFieldEntry(textFields, 'presentation', docUrls.presentation)

  await payload.update({
    collection: 'homepage-links',
    id: row.id,
    data: {
      data,
      textFields,
    },
    depth: 0,
    context: { disableRevalidate: true },
    overrideLock: true,
  })
  payload.logger.info(`[wix-doc-sync] Updated homepage-links row #${String(row.id)} document URLs.`)
}

async function updatePageBySlug(
  payload: Payload,
  slug: PageSlug,
  data: Record<string, unknown>,
): Promise<void> {
  const result = await payload.find({
    collection: 'pages',
    where: {
      slug: { equals: slug },
    },
    limit: 1,
    pagination: false,
    depth: 0,
  })
  const page = result.docs?.[0] as { id: ScalarId } | undefined
  if (!page) {
    payload.logger.warn(`[wix-doc-sync] Page "${slug}" not found; skipped update.`)
    return
  }

  await payload.update({
    collection: 'pages',
    id: page.id,
    data,
    depth: 0,
    context: { disableRevalidate: true },
    overrideLock: true,
  })
  payload.logger.info(`[wix-doc-sync] Updated page "${slug}" (#${String(page.id)}).`)
}

async function updateFundRelatedLinks(
  payload: Payload,
  mediaIdsByKey: Record<DocumentKey, MediaId>,
  docUrlsByKey: Record<DocumentKey, string>,
): Promise<void> {
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'fund' } },
    limit: 1,
    pagination: false,
    depth: 0,
  })
  const page = result.docs?.[0] as
    | {
        id: ScalarId
        fundRelatedPrimaryLabel?: unknown
        fundRelatedSecondaryLabel?: unknown
        fundRelatedTertiaryLabel?: unknown
      }
    | undefined

  if (!page) return

  const updates: Record<string, unknown> = {}
  const slots: Array<{ name: 'Primary' | 'Secondary' | 'Tertiary'; label: unknown }> = [
    { name: 'Primary', label: page.fundRelatedPrimaryLabel },
    { name: 'Secondary', label: page.fundRelatedSecondaryLabel },
    { name: 'Tertiary', label: page.fundRelatedTertiaryLabel },
  ]

  for (const slot of slots) {
    const key = docKeyFromLabel(slot.label)
    if (!key) continue
    updates[`fundRelated${slot.name}Asset`] = mediaIdsByKey[key]
    updates[`fundRelated${slot.name}Href`] = docUrlsByKey[key]
  }

  if (Object.keys(updates).length === 0) {
    payload.logger.info('[wix-doc-sync] No fund related link labels matched document types; skipped.')
    return
  }

  await payload.update({
    collection: 'pages',
    id: page.id,
    data: updates,
    depth: 0,
    context: { disableRevalidate: true },
    overrideLock: true,
  })
  payload.logger.info('[wix-doc-sync] Updated matched fund related link fields.')
}

async function updateMegatrendsRelatedLinks(
  payload: Payload,
  mediaIdsByKey: Record<DocumentKey, MediaId>,
  docUrlsByKey: Record<DocumentKey, string>,
): Promise<void> {
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'megatrends' } },
    limit: 1,
    pagination: false,
    depth: 0,
  })
  const page = result.docs?.[0] as
    | {
        id: ScalarId
        megatrendsRelatedPrimaryLabel?: unknown
        megatrendsRelatedSecondaryLabel?: unknown
      }
    | undefined
  if (!page) return

  const updates: Record<string, unknown> = {}
  const slots: Array<{ name: 'Primary' | 'Secondary'; label: unknown }> = [
    { name: 'Primary', label: page.megatrendsRelatedPrimaryLabel },
    { name: 'Secondary', label: page.megatrendsRelatedSecondaryLabel },
  ]

  for (const slot of slots) {
    const key = docKeyFromLabel(slot.label)
    if (!key) continue
    updates[`megatrendsRelated${slot.name}Asset`] = mediaIdsByKey[key]
    updates[`megatrendsRelated${slot.name}Href`] = docUrlsByKey[key]
  }

  if (Object.keys(updates).length === 0) {
    payload.logger.info('[wix-doc-sync] No megatrends related link labels matched document types; skipped.')
    return
  }

  await payload.update({
    collection: 'pages',
    id: page.id,
    data: updates,
    depth: 0,
    context: { disableRevalidate: true },
    overrideLock: true,
  })
  payload.logger.info('[wix-doc-sync] Updated matched megatrends related link fields.')
}

async function main() {
  const [{ default: config }, { getPayload }] = await Promise.all([
    import('@payload-config'),
    import('payload'),
  ])
  const payload = await getPayload({ config })
  const docUrlsByKey = await fetchLatestWixDocumentUrls(payload)

  const mediaIdsByKey = {} as Record<DocumentKey, MediaId>
  for (const key of REQUIRED_DOC_KEYS) {
    const mediaId = await upsertPdfMedia(payload, {
      key,
      label: DOC_LABEL[key],
      sourceUrl: docUrlsByKey[key],
    })
    mediaIdsByKey[key] = mediaId
    payload.logger.info(`[wix-doc-sync] linked ${key} -> media #${String(mediaId)}`)
  }

  const footer = await payload.findGlobal({
    slug: 'footer',
    depth: 0,
  })

  await payload.updateGlobal({
    slug: 'footer',
    data: {
      ...(Array.isArray(footer.navItems) ? { navItems: footer.navItems } : {}),
      downloads: {
        factsheetUsd: mediaIdsByKey.factsheetUsd,
        factsheetChfHedged: mediaIdsByKey.factsheetChfHedged,
        fundCommentary: mediaIdsByKey.fundCommentary,
        presentation: mediaIdsByKey.presentation,
      },
    },
    depth: 0,
    context: { disableRevalidate: true },
    overrideLock: true,
  })
  payload.logger.info('[wix-doc-sync] Footer downloads updated.')

  await updatePageBySlug(payload, 'home', {
    homeDownloads: {
      factsheetUsd: mediaIdsByKey.factsheetUsd,
      factsheetChfHedged: mediaIdsByKey.factsheetChfHedged,
      fundCommentary: mediaIdsByKey.fundCommentary,
      presentation: mediaIdsByKey.presentation,
    },
  })

  await updatePageBySlug(payload, 'performance-analysis', {
    performanceFactsheetUsdAsset: mediaIdsByKey.factsheetUsd,
    performanceFactsheetUsdHref: docUrlsByKey.factsheetUsd,
    performanceFactsheetChfAsset: mediaIdsByKey.factsheetChfHedged,
    performanceFactsheetChfHref: docUrlsByKey.factsheetChfHedged,
    performanceFundCommentaryAsset: mediaIdsByKey.fundCommentary,
    performanceFundCommentaryHref: docUrlsByKey.fundCommentary,
  })

  await updateFundRelatedLinks(payload, mediaIdsByKey, docUrlsByKey)
  await updateMegatrendsRelatedLinks(payload, mediaIdsByKey, docUrlsByKey)
  await updateHomepagelinksCollection(payload, docUrlsByKey)

  payload.logger.info('[wix-doc-sync] Completed Wix documents sync to Payload.')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
