import configPromise from '@payload-config'
import { cache } from 'react'
import { getPayload } from 'payload'
import fallbacks from '@/constants/fallbacks.json'

type RegulatoryItem = {
  label: string
  value: string
}

type TrendItem = {
  title: string
  body: string
  tickers: [string, string][]
  imageUrl: string
}

type DownloadItem = {
  id: 'factsheetUsd' | 'factsheetChfHedged' | 'fundCommentary' | 'presentation'
  label: string
  href: string
}

type ExploreMegatrendsCard = {
  title: string
  imageUrl: string
}

type CMSRecord = Record<string, unknown>
type ParsedTrendItem = TrendItem & { manualSort: string; imageSource: string; mediaUpload: unknown }
type MediaLike = {
  url?: unknown
  filename?: unknown
}

type HomeMegatrendCardRecord = {
  title?: unknown
  body?: unknown
  tickers?: unknown
  image?: unknown
  imageSrc?: unknown
  sortOrder?: unknown
}

const REQUIRED_HOME_DOWNLOADS: Array<{
  id: DownloadItem['id']
  label: string
}> = [
  {
    id: 'factsheetUsd',
    label: 'Factsheet USD',
  },
  {
    id: 'factsheetChfHedged',
    label: 'Factsheet CHF Hedged',
  },
  {
    id: 'fundCommentary',
    label: 'Fund Commentary',
  },
  {
    id: 'presentation',
    label: 'Presentation',
  },
]

export type HomeCMSContent = {
  hero: {
    heading: string
    subtitle: string
    ctaLabel: string
    ctaHref: string
  }
  regulatoryItems: RegulatoryItem[]
  trends: TrendItem[]
  downloads: DownloadItem[]
  exploreMegatrendsCard: ExploreMegatrendsCard
  regulatoryNotice: {
    title: string
    body: string
    address: string
  }
}

const EMPTY_HOME_CONTENT: HomeCMSContent = {
  hero: {
    heading: fallbacks.home.hero.heading,
    subtitle: fallbacks.home.hero.subtitle,
    ctaLabel: fallbacks.home.hero.ctaLabel,
    ctaHref: fallbacks.home.hero.ctaHref,
  },
  regulatoryItems: [],
  trends: [],
  downloads: [],
  exploreMegatrendsCard: {
    title: fallbacks.home.exploreMegatrendsCard.title,
    imageUrl: fallbacks.home.exploreMegatrendsCard.imageUrl,
  },
  regulatoryNotice: {
    title: fallbacks.home.regulatoryNotice.title,
    body: fallbacks.home.regulatoryNotice.body,
    address: fallbacks.home.regulatoryNotice.address,
  },
}

function richTextToParagraphs(richText: unknown): string[] {
  const root = (richText as { root?: { children?: Array<Record<string, unknown>> } } | null)?.root
  const children = Array.isArray(root?.children) ? root.children : []

  return children
    .map((node) => {
      const textChildren = Array.isArray(node?.children)
        ? (node.children as Array<Record<string, unknown>>)
        : []

      const text = textChildren
        .filter((child) => child?.type === 'text' && typeof child.text === 'string')
        .map((child) => child.text as string)
        .join('')
        .trim()

      return text
    })
    .filter(Boolean)
}

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function resolveCMSImageUrl(value: string): string {
  if (!value) return ''
  if (value.startsWith('/api/media/file/')) {
    return resolvePayloadApiMediaPath(value)
  }
  if (value.startsWith('/')) return value
  if (value.startsWith('http://') || value.startsWith('https://')) {
    // Keep only already-migrated storage URLs; block other external image hosts.
    return value.includes('/storage/v1/object/public/') ? value : ''
  }

  // Disallow Wix tokens in frontend content; CMS rows should already reference local media URLs.
  if (value.startsWith('wix:image://') || value.startsWith('wix:document://')) return ''
  if (value.includes('.')) return value

  return value
}

function getRecordTextValue(
  record: Record<string, unknown>,
  key: string,
  keyPrefix?: string,
): string | null {
  const direct = record[key]
  if (typeof direct === 'string' && direct.trim() !== '') {
    return direct
  }

  const textFields = Array.isArray(record.textFields)
    ? (record.textFields as Array<Record<string, unknown>>)
    : []

  const match = textFields.find((entry) => {
    const entryKey = entry?.key
    if (typeof entryKey !== 'string') return false
    if (entryKey === key) return true
    if (keyPrefix && entryKey.startsWith(keyPrefix)) return true
    return false
  })

  const value = match?.value
  if (typeof value === 'string' && value.trim() !== '') {
    return value
  }

  return null
}

function getRecordObjectValue(record: Record<string, unknown>, key: string): unknown {
  const direct = record[key]
  if (typeof direct === 'object' && direct !== null) {
    return direct
  }

  const objectFields = Array.isArray(record.objectFields)
    ? (record.objectFields as Array<Record<string, unknown>>)
    : []

  const match = objectFields.find((entry) => {
    const entryKey = entry?.key
    return typeof entryKey === 'string' && entryKey === key
  })

  return match?.value
}

function getRecordMediaFieldValue(record: Record<string, unknown>, key: string): unknown {
  const direct = record[key]
  if (direct !== undefined && direct !== null) {
    return direct
  }

  const mediaFields = Array.isArray(record.mediaFields)
    ? (record.mediaFields as Array<Record<string, unknown>>)
    : []

  const match = mediaFields.find((entry) => {
    const entryKey = entry?.key
    return typeof entryKey === 'string' && entryKey === key
  })

  return match?.value
}

function extractImageSourceFromUnknown(value: unknown, depth = 0): string | null {
  if (depth > 4 || value == null) return null

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return null
    return resolveCMSImageUrl(trimmed)
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const resolved = extractImageSourceFromUnknown(item, depth + 1)
      if (resolved) return resolved
    }
    return null
  }

  if (typeof value !== 'object') return null

  const record = value as CMSRecord
  const directStringKeys = [
    'url',
    'src',
    'id',
    'imageUrl',
    'imageURL',
    'imageSrc',
    'coverImage',
    'thumbnail',
  ]

  for (const key of directStringKeys) {
    const candidate = record[key]
    if (typeof candidate === 'string' && candidate.trim() !== '') {
      return resolveCMSImageUrl(candidate)
    }
  }

  const nestedKeys = ['image', 'media', 'file', 'asset', 'source', 'cover', 'coverImage', 'thumbnail']
  for (const key of nestedKeys) {
    const resolved = extractImageSourceFromUnknown(record[key], depth + 1)
    if (resolved) return resolved
  }

  return null
}

function fallbackTrendImageByTitle(title: string): string {
  void title
  return ''
}

function parseTrendImageSource(data: CMSRecord): string | null {
  const textCandidates = [
    'image_fld',
    'image',
    'imageUrl',
    'imageURL',
    'imageSrc',
    'megatrendImage',
    'trendImage',
    'coverImage',
    'thumbnail',
    'icon',
    'iconUrl',
    'iconURL',
  ]

  for (const key of textCandidates) {
    const value = getRecordTextValue(data, key)
    if (value) return resolveCMSImageUrl(value)
  }

  // Prefer explicit object-based image field names from source data first.
  const explicitObjectCandidates = ['image_fld', 'image', 'media', 'file', 'asset']
  for (const key of explicitObjectCandidates) {
    const value = getRecordObjectValue(data, key)
    const resolved = extractImageSourceFromUnknown(value)
    if (resolved) return resolved
  }

  // Keep a conservative fallback set in case source shape drifts.
  const objectCandidates = [
    'coverImage',
    'thumbnail',
    'icon',
    'trendImage',
    'megatrendImage',
  ]

  for (const key of objectCandidates) {
    const value = getRecordObjectValue(data, key)
    const resolved = extractImageSourceFromUnknown(value)
    if (resolved) return resolved
  }

  return null
}

function parseTrendImageUpload(doc: CMSRecord): unknown {
  const mediaCandidates = [
    'image_fld',
    'image',
    'imageUrl',
    'imageURL',
    'imageSrc',
    'megatrendImage',
    'trendImage',
    'coverImage',
    'thumbnail',
    'icon',
    'iconUrl',
    'iconURL',
  ]

  for (const key of mediaCandidates) {
    const value = getRecordMediaFieldValue(doc, key)
    if (value !== undefined && value !== null) {
      return value
    }
  }

  return null
}

function getRecordSortValue(record: CMSRecord): string {
  const directSort = getRecordTextValue(record, '_manualSort_', '_manualSort_')
  if (directSort) return directSort

  const raw = record._manualSort
  return typeof raw === 'string' ? raw : ''
}

function parseCMSRichParagraphs(richContent: unknown): string[] {
  const nodes = (richContent as { nodes?: unknown[] } | null)?.nodes
  if (!Array.isArray(nodes)) return []

  return nodes
    .map((node) => {
      const nodeRecord = (node ?? {}) as CMSRecord
      const children = Array.isArray(nodeRecord.nodes) ? (nodeRecord.nodes as CMSRecord[]) : []
      const text = children
        .map((child) => {
          const textData = (child.textData && typeof child.textData === 'object'
            ? child.textData
            : {}) as CMSRecord
          return typeof textData.text === 'string' ? textData.text : ''
        })
        .join('')
      return stripHtml(text)
    })
    .filter((paragraph) => paragraph.length > 0)
}

function normalizeRegulatoryLabel(label: string): string {
  const normalized = label.trim().toLowerCase().replace(/\s+/g, ' ')
  if (normalized === 'lichtenstein' || normalized === 'liechtenstein') return 'liechtenstein'
  return normalized
}

function parseTrustListItems(docs: Array<Record<string, unknown>>): RegulatoryItem[] {
  const sorted = docs
    .map((doc) => {
      const data = (doc.data && typeof doc.data === 'object'
        ? doc.data
        : {}) as Record<string, unknown>

      const label = getRecordTextValue(data, 'title_fld')
      const rawValue = getRecordTextValue(data, 'description_fld')
      const value = rawValue ? stripHtml(rawValue) : null
      const manualSort = getRecordSortValue(data)

      if (!label || !value) {
        return null
      }

      return { label, value, manualSort }
    })
    .filter((item): item is RegulatoryItem & { manualSort: string } => item !== null)
    .sort((a, b) => {
      // Trust-list order should come from CMS _manualSort directly.
      if (a.manualSort !== b.manualSort) return b.manualSort.localeCompare(a.manualSort)
      return a.label.localeCompare(b.label)
    })

  const seenLabels = new Set<string>()
  const deduped: RegulatoryItem[] = []

  for (const item of sorted) {
    const normalizedLabel = normalizeRegulatoryLabel(item.label)
    if (!normalizedLabel || seenLabels.has(normalizedLabel)) continue
    seenLabels.add(normalizedLabel)
    deduped.push({ label: item.label, value: item.value })
  }

  return deduped
}

function parseTrendItems(docs: CMSRecord[]): ParsedTrendItem[] {
  return docs
    .map((doc) => {
      const docRecord = (doc ?? {}) as CMSRecord
      const data = (docRecord.data && typeof docRecord.data === 'object' ? docRecord.data : {}) as CMSRecord
      const title = getRecordTextValue(data, 'title_fld')
      const descriptionHtml = getRecordTextValue(data, 'description_fld')
      const body = descriptionHtml ? stripHtml(descriptionHtml) : ''

      const firstCode = getRecordTextValue(data, 'firstStockCode')
      const firstName = getRecordTextValue(data, 'firstStockName')
      const secondCode = getRecordTextValue(data, 'secondStockCode')
      const secondName = getRecordTextValue(data, 'secondStockName')
      const tickers: [string, string][] = []

      if (firstCode && firstName) tickers.push([firstCode, firstName])
      if (secondCode && secondName) tickers.push([secondCode, secondName])

      const manualSort = getRecordSortValue(data)
      const imageSource = parseTrendImageSource(data)
      const mediaUpload = parseTrendImageUpload(docRecord)

      if (!title || !body) return null
      return {
        title,
        body,
        tickers,
        imageUrl: imageSource || fallbackTrendImageByTitle(title),
        imageSource: imageSource || '',
        mediaUpload,
        manualSort,
      }
    })
    .filter((item): item is ParsedTrendItem => item !== null)
    .sort((a, b) => {
      if (a.manualSort !== b.manualSort) return b.manualSort.localeCompare(a.manualSort)
      return b.title.localeCompare(a.title)
    })
    .map((item) => item)
}

function parseHomeMegatrendCards(docs: Array<Record<string, unknown>>): ParsedTrendItem[] {
  return docs
    .map((doc) => {
      const card = doc as HomeMegatrendCardRecord
      const title = typeof card.title === 'string' ? card.title.trim() : ''
      const body = typeof card.body === 'string' ? card.body.trim() : ''
      if (!title || !body) return null

      const imageSource = typeof card.imageSrc === 'string' ? card.imageSrc.trim() : ''
      const imageUrlFromUpload = resolveMediaLikeUrl(card.image)
      const imageUrlFromSource = imageSource ? resolveCMSImageUrl(imageSource) : ''

      const tickerRows = Array.isArray(card.tickers) ? (card.tickers as Array<Record<string, unknown>>) : []
      const tickers = tickerRows
        .map((row, index) => {
          const ticker = typeof row.ticker === 'string' ? row.ticker.trim() : ''
          const company = typeof row.company === 'string' ? row.company.trim() : ''
          const sortOrder = typeof row.sortOrder === 'number' && Number.isFinite(row.sortOrder) ? row.sortOrder : index
          if (!ticker || !company) return null
          return { ticker, company, sortOrder }
        })
        .filter((row): row is { ticker: string; company: string; sortOrder: number } => Boolean(row))
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((row) => [row.ticker, row.company] as [string, string])

      const manualSort =
        typeof card.sortOrder === 'number' && Number.isFinite(card.sortOrder)
          ? String(card.sortOrder).padStart(6, '0')
          : ''

      return {
        title,
        body,
        tickers,
        imageUrl: imageUrlFromUpload || imageUrlFromSource || fallbackTrendImageByTitle(title),
        imageSource,
        mediaUpload: card.image,
        manualSort,
      }
    })
    .filter((item): item is ParsedTrendItem => item !== null)
}

async function resolveHomeMegatrendCardDocsInOrder(args: {
  payload: Awaited<ReturnType<typeof getPayload>>
  raw: unknown
}): Promise<Array<Record<string, unknown>>> {
  const { payload, raw } = args
  if (!Array.isArray(raw)) return []

  const objectEntries = raw.filter(
    (entry): entry is Record<string, unknown> => Boolean(entry && typeof entry === 'object'),
  )
  if (objectEntries.length > 0) return objectEntries

  const idsInOrder = raw.filter(
    (entry): entry is number | string => typeof entry === 'number' || typeof entry === 'string',
  )
  if (idsInOrder.length === 0) return []

  const fetched = await payload.find({
    collection: 'home-megatrend-cards',
    limit: idsInOrder.length,
    pagination: false,
    depth: 1,
    where: {
      id: {
        in: idsInOrder,
      },
    },
  })

  const byId = new Map<string, Record<string, unknown>>()
  for (const doc of fetched.docs || []) {
    byId.set(String((doc as { id?: unknown }).id), doc as unknown as Record<string, unknown>)
  }

  return idsInOrder
    .map((id) => byId.get(String(id)))
    .filter((doc): doc is Record<string, unknown> => Boolean(doc))
}

function normalizeTrendTitle(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, ' ')
}

function dedupeTrendItemsByTitle(trends: TrendItem[]): {
  deduped: TrendItem[]
  removed: number
  duplicateTitles: string[]
} {
  const seenTitles = new Set<string>()
  const duplicateTitles: string[] = []
  const deduped: TrendItem[] = []

  for (const trend of trends) {
    const normalizedTitle = normalizeTrendTitle(trend.title)
    if (!normalizedTitle) continue

    if (seenTitles.has(normalizedTitle)) {
      duplicateTitles.push(trend.title)
      continue
    }

    seenTitles.add(normalizedTitle)
    deduped.push(trend)
  }

  return {
    deduped,
    removed: trends.length - deduped.length,
    duplicateTitles: Array.from(new Set(duplicateTitles)),
  }
}

function parseExploreMegatrendsTitle(data: CMSRecord): string {
  const candidates = [
    'exploreMegatrendsTitle',
    'exploreOurMegatrendsTitle',
    'exploreMegatrendsLabel',
    'exploreOurMegatrendsLabel',
    'megatrendsTitle',
    'ourMegatrendsTitle',
  ]

  for (const key of candidates) {
    const value = getRecordTextValue(data, key)
    if (value) return stripHtml(value)
  }

  return ''
}

function parseExploreMegatrendsImageSource(data: CMSRecord): string {
  const candidates = [
    'exploreMegatrendsImage',
    'exploreOurMegatrendsImage',
    'exploreMegatrendsIcon',
    'exploreOurMegatrendsIcon',
    'megatrendsImage',
    'megatrendsIcon',
  ]

  for (const key of candidates) {
    const value = getRecordTextValue(data, key)
    if (value) return resolveCMSImageUrl(value)
  }

  return ''
}

function parseRegulatoryNoticeFromCMS(
  legalDocs: CMSRecord[],
  contactDocs: CMSRecord[],
): HomeCMSContent['regulatoryNotice'] | null {
  const legalData = ((legalDocs[0]?.data as CMSRecord | undefined) ?? {}) as CMSRecord
  const contactData = ((contactDocs[0]?.data as CMSRecord | undefined) ?? {}) as CMSRecord

  const title = getRecordTextValue(legalData, 'title_fld')
  const legalParagraphs = parseCMSRichParagraphs(legalData.richcontent)
  const body =
    legalParagraphs.find((paragraph) => /portfolio management/i.test(paragraph)) ??
    legalParagraphs[0] ??
    ''

  const addressRaw = getRecordTextValue(contactData, 'address')
  const websiteName = getRecordTextValue(contactData, 'websiteName')
  const websiteUrl = getRecordTextValue(contactData, 'websiteUrl')

  const addressParts: string[] = []
  if (addressRaw) {
    addressParts.push(addressRaw.replace(/\s*\n\s*/g, ' · ').trim())
  }
  if (websiteName) {
    addressParts.push(websiteName.trim())
  } else if (websiteUrl) {
    try {
      const host = new URL(websiteUrl).host
      addressParts.push(host)
    } catch {
      addressParts.push(websiteUrl.trim())
    }
  }

  if (!title && !body && addressParts.length === 0) return null

  return {
    title: title || '',
    body: body || '',
    address: addressParts.join(' · ') || '',
  }
}

function resolveSupabasePublicMediaUrl(filename: string): string | null {
  if (!filename) return null

  const endpoint = process.env.S3_ENDPOINT
  const bucket = process.env.S3_BUCKET
  if (!endpoint || !bucket) return null

  try {
    const endpointUrl = new URL(endpoint)
    const baseOrigin = endpointUrl.origin
    const encodedFilename = filename
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/')

    return `${baseOrigin}/storage/v1/object/public/${bucket}/${encodedFilename}`
  } catch {
    return null
  }
}

function resolveMediaLikeUrl(media: unknown): string {
  if (!media || typeof media !== 'object') return ''

  const mediaRecord = media as MediaLike
  const directUrl = mediaRecord.url
  if (typeof directUrl === 'string' && directUrl.trim() !== '') {
    return resolveCMSImageUrl(directUrl.trim())
  }

  const filename = mediaRecord.filename
  if (typeof filename === 'string' && filename.trim() !== '') {
    return resolveSupabasePublicMediaUrl(filename.trim()) || ''
  }

  return ''
}

class HomeDownloadAssetError extends Error {
  constructor(
    public readonly field: DownloadItem['id'],
    message: string,
  ) {
    super(message)
    this.name = 'HomeDownloadAssetError'
  }
}

function resolveRequiredHomeDownloadUrl(args: {
  media: unknown
  field: DownloadItem['id']
  label: string
  pageId: unknown
  pageSlug: string
}): string {
  const href = resolveMediaLikeUrl(args.media)
  if (href) return href

  throw new HomeDownloadAssetError(
    args.field,
    `Missing or unresolvable Home download asset for "${args.label}" (field: "${args.field}") on page #${String(args.pageId)} (${args.pageSlug}).`,
  )
}

function normalizeMediaLookupSource(source: string): string {
  if (source.startsWith('wix:image://v1/')) {
    const fileId = source.replace('wix:image://v1/', '').split('/')[0]
    return fileId ? `https://static.wixstatic.com/media/${fileId}` : source
  }

  if (source.startsWith('wix:document://v1/ugd/')) {
    const fileId = source.replace('wix:document://v1/ugd/', '').split('/')[0]
    return fileId ? `https://www.impgmtfund.com/_files/ugd/${fileId}` : source
  }

  return source
}

function resolvePayloadApiMediaPath(source: string): string {
  if (!source.startsWith('/api/media/file/')) return ''

  const filename = source.replace('/api/media/file/', '').split('?')[0]?.split('#')[0]?.trim() || ''
  if (!filename) return ''

  return resolveSupabasePublicMediaUrl(filename) || ''
}

async function resolveMediaUrlFromSource(
  payload: Awaited<ReturnType<typeof getPayload>>,
  source: string,
): Promise<string> {
  if (!source) return ''
  if (source.startsWith('/api/media/file/')) {
    const resolvedApiMediaPath = resolvePayloadApiMediaPath(source)
    if (resolvedApiMediaPath) return resolvedApiMediaPath
  }
  if (source.startsWith('/') && !source.startsWith('/api/media/file/')) return source
  if (
    (source.startsWith('http://') || source.startsWith('https://')) &&
    source.includes('/storage/v1/object/public/')
  ) {
    return source
  }

  const lookupSource = normalizeMediaLookupSource(source)

  let mediaBySource = await payload.find({
    collection: 'media',
    limit: 1,
    pagination: false,
    depth: 0,
    where: {
      sourceUrl: { equals: lookupSource },
    },
  })

  // Backward-compatible fallback in case legacy rows stored raw tokens.
  if ((mediaBySource.docs?.length ?? 0) === 0 && lookupSource !== source) {
    mediaBySource = await payload.find({
      collection: 'media',
      limit: 1,
      pagination: false,
      depth: 0,
      where: {
        sourceUrl: { equals: source },
      },
    })
  }

  if ((mediaBySource.docs?.length ?? 0) === 0 && source.startsWith('/api/media/file/')) {
    mediaBySource = await payload.find({
      collection: 'media',
      limit: 1,
      pagination: false,
      depth: 0,
      where: {
        url: { equals: source },
      },
    })
  }

  const mediaDoc = mediaBySource.docs?.[0] as { url?: unknown; filename?: unknown } | undefined
  const mediaFilename = mediaDoc?.filename
  if (typeof mediaFilename === 'string' && mediaFilename.trim() !== '') {
    const supabaseMediaUrl = resolveSupabasePublicMediaUrl(mediaFilename)
    if (supabaseMediaUrl) return supabaseMediaUrl
  }

  const mediaUrl = mediaDoc?.url
  if (typeof mediaUrl === 'string' && mediaUrl.trim() !== '') {
    return resolveCMSImageUrl(mediaUrl.trim())
  }

  // Prefer predictable bucket object URL fallback for known UGD file identifiers.
  const ugdMatch =
    source.match(/wix:document:\/\/v1\/ugd\/([^/]+)/) ?? source.match(/\/_files\/ugd\/([^/?#]+)/)
  if (ugdMatch?.[1]) {
    const bucketUrl = resolveSupabasePublicMediaUrl(ugdMatch[1])
    if (bucketUrl) return bucketUrl
  }

  // Never expose unresolved external/source URLs to the frontend.
  return ''
}

export const getHomeCMSContent = cache(async (): Promise<HomeCMSContent> => {
  let payload: Awaited<ReturnType<typeof getPayload>> | null = null

  try {
    payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'pages',
      limit: 1,
      pagination: false,
      depth: 2,
      where: {
        slug: { equals: 'home' },
      },
    })

    const page = result.docs?.[0]
    if (!page) return EMPTY_HOME_CONTENT

    const trustListResult = await payload.find({
      collection: 'trust-list',
      limit: 100,
      pagination: false,
      depth: 0,
    })
    const trustListDocs = (trustListResult.docs ?? []) as unknown as Array<Record<string, unknown>>
    const trustListItems = parseTrustListItems(trustListDocs)

    if (trustListItems.length === 0) {
      payload.logger.warn('Regulatory strip data missing: no valid rows found in payload collection trust-list.')
    }

    const pageRecord = page as {
      homeDownloads?: {
        factsheetUsd?: unknown
        factsheetChfHedged?: unknown
        fundCommentary?: unknown
        presentation?: unknown
      }
      homeMegatrendCards?: unknown
    }

    const linkedHomeMegatrendCards = await resolveHomeMegatrendCardDocsInOrder({
      payload,
      raw: pageRecord.homeMegatrendCards,
    })

    const relationshipTrendItems = parseHomeMegatrendCards(linkedHomeMegatrendCards)
    const trendItems =
      relationshipTrendItems.length > 0
        ? relationshipTrendItems
        : await (async () => {
            payload.logger.warn(
              'Home megatrend cards relationship is empty; falling back to legacy collection megatrend-dataset.',
            )

            const trendResult = await payload.find({
              collection: 'megatrend-dataset',
              limit: 100,
              pagination: false,
              depth: 2,
            })
            const trendDocs = (trendResult.docs ?? []) as unknown as CMSRecord[]
            return parseTrendItems(trendDocs)
          })()

    const trendsWithResolvedImages = await Promise.all(
      trendItems.map(async (trend) => {
        const mediaFieldImageUrl = resolveMediaLikeUrl(trend.mediaUpload)
        const resolvedImageUrl =
          mediaFieldImageUrl ||
          (trend.imageSource ? await resolveMediaUrlFromSource(payload!, trend.imageSource) : trend.imageUrl)

        return {
          title: trend.title,
          body: trend.body,
          tickers: trend.tickers,
          imageUrl: resolvedImageUrl || fallbackTrendImageByTitle(trend.title),
        }
      }),
    )
    const dedupedTrendResult = dedupeTrendItemsByTitle(trendsWithResolvedImages)
    const dedupedTrendsWithResolvedImages = dedupedTrendResult.deduped

    if (dedupedTrendResult.removed > 0) {
      payload.logger.warn(
        `Removed ${dedupedTrendResult.removed} duplicate home megatrend entries by title: ${dedupedTrendResult.duplicateTitles.join(', ')}`,
      )
    }

    if (trendItems.length === 0) {
      payload.logger.warn('Trend data missing: no valid rows found in home-megatrend-cards or megatrend-dataset.')
    }

    // Canonical source for homepage downloads is pages(home).homeDownloads.* .
    // Strict mode intentionally throws when any required download media cannot resolve.
    // When rotating assets, update the media relations in the Home document.
    const resolvedDownloads: DownloadItem[] = REQUIRED_HOME_DOWNLOADS.map(({ id, label }) => ({
      id,
      label,
      href: resolveRequiredHomeDownloadUrl({
        media: pageRecord.homeDownloads?.[id],
        field: id,
        label,
        pageId: (page as { id?: unknown }).id,
        pageSlug: 'home',
      }),
    }))

    const downloadResult = await payload.find({
      collection: 'homepage-links',
      limit: 10,
      pagination: false,
      depth: 0,
    })
    const downloadDocs = (downloadResult.docs ?? []) as unknown as CMSRecord[]
    const downloadData = ((downloadDocs[0]?.data as CMSRecord | undefined) ?? {}) as CMSRecord

    const exploreMegatrendsTitle = parseExploreMegatrendsTitle(downloadData)
    const exploreMegatrendsImageSource = parseExploreMegatrendsImageSource(downloadData)

    const exploreMegatrendsImageUrl = exploreMegatrendsImageSource
      ? await resolveMediaUrlFromSource(payload!, exploreMegatrendsImageSource)
      : ''

    const legalResult = await payload.find({
      collection: 'legal-information',
      limit: 5,
      pagination: false,
      depth: 0,
    })
    const legalDocs = (legalResult.docs ?? []) as unknown as CMSRecord[]

    const contactResult = await payload.find({
      collection: 'contact-us',
      limit: 5,
      pagination: false,
      depth: 0,
    })
    const contactDocs = (contactResult.docs ?? []) as unknown as CMSRecord[]

    const regulatoryNoticeFromCMS = parseRegulatoryNoticeFromCMS(legalDocs, contactDocs)
    if (!regulatoryNoticeFromCMS) {
      payload.logger.warn('Regulatory notice data missing in payload collections legal-information / contact-us.')
    }

    const heroParagraphs = richTextToParagraphs(page.hero?.richText)
    const heroSource = heroParagraphs[0] ?? ''
    const heroSplit = heroSource.split('Harnessing')
    const heroHeading = (heroSplit[0] ?? '').replace(/\.+$/, '').trim()
    const heroSubtitle = heroSplit[1] ? `Harnessing${heroSplit[1]}`.trim() : ''
    const heroRecord = page as { heroCtaLabel?: unknown; heroCtaHref?: unknown }
    const heroCtaLabel = typeof heroRecord.heroCtaLabel === 'string' ? heroRecord.heroCtaLabel.trim() : ''
    const heroCtaHref = typeof heroRecord.heroCtaHref === 'string' ? heroRecord.heroCtaHref.trim() : ''

    return {
      hero: {
        heading: heroHeading || '',
        subtitle: heroSubtitle || '',
        ctaLabel: heroCtaLabel,
        ctaHref: heroCtaHref,
      },
      regulatoryItems: trustListItems,
      trends: dedupedTrendsWithResolvedImages,
      downloads: resolvedDownloads,
      exploreMegatrendsCard: {
        title: exploreMegatrendsTitle || EMPTY_HOME_CONTENT.exploreMegatrendsCard.title,
        imageUrl: exploreMegatrendsImageUrl || EMPTY_HOME_CONTENT.exploreMegatrendsCard.imageUrl,
      },
      regulatoryNotice: regulatoryNoticeFromCMS ?? EMPTY_HOME_CONTENT.regulatoryNotice,
    }
  } catch (error) {
    if (error instanceof HomeDownloadAssetError) {
      payload?.logger.error(`[home-downloads] ${error.message}`)
      throw error
    }
    return EMPTY_HOME_CONTENT
  }
})
