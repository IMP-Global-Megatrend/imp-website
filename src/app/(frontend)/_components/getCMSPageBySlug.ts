import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'

export async function getCMSPageBySlug(slug: string) {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: {
      slug: { equals: slug },
    },
  })

  return result.docs?.[0] ?? null
}

export async function getCMSAboutUsVideoUrl(): Promise<string | null> {
  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'pages',
      limit: 1,
      pagination: false,
      depth: 1,
      where: {
        slug: { equals: 'about-us' },
      },
    })

    const page = result.docs?.[0] as
      | {
          aboutUsVideo?: {
            url?: unknown
            filename?: unknown
          }
        }
      | undefined

    const mediaUrl = page?.aboutUsVideo?.url
    if (typeof mediaUrl === 'string' && mediaUrl.trim()) {
      const normalizedUrl = normalizeCMSMediaUrl(mediaUrl.trim())
      if (normalizedUrl) return normalizedUrl
    }

    const mediaFilename = page?.aboutUsVideo?.filename
    if (typeof mediaFilename === 'string' && mediaFilename.trim()) {
      const resolvedUrl = resolveSupabasePublicMediaUrl(mediaFilename.trim())
      if (resolvedUrl) return resolvedUrl
    }

    return null
  } catch {
    return null
  }
}

type HeroCopy = {
  title?: string
  subtitle?: string
}

type ShareClassIdentity = 'usd' | 'chf'
type FundDetailIcon = 'circleDollar' | 'boxes' | 'mapPinCheck' | 'shieldCheck' | 'graduationCap' | 'trendingUp'

export type FundShareClassMeta = Record<
  ShareClassIdentity,
  {
    isinLabel: string
    isinValue: string
    wknLabel: string
    wknValue: string
    bloombergLabel: string
    bloombergValue: string
  }
>

export type FundDetailItem = {
  label: string
  value: string
  icon: FundDetailIcon
}

export type PerformanceNavPoint = {
  dateISO: string
  nav: number
}

export type CMSPerformanceShareClassDetails = {
  nav?: string
  perfYTD?: string
  asOf?: string
  sharpe?: string
  volatility?: string
  sortino?: string
  downsideRisk?: string
  fundDetails?: Array<[string, string]>
}

export type CMSPerformancePageData = {
  pageTitle?: string
  annualPerformanceTitle?: string
  usdLabel?: string
  chfLabel?: string
  exportSvgTooltip?: string
  exportCsvTooltip?: string
  chartYearBadge?: string
  navUpdatesTitle?: string
  navPerShareLabel?: string
  performanceMetricsTitle?: string
  asOfPrefix?: string
  performanceYtdLabel?: string
  riskMetricsTitle?: string
  sharpeRatioLabel?: string
  volatilityLabel?: string
  sortinoRatioLabel?: string
  downsideRiskLabel?: string
  fundDetailsTitle?: string
  footnoteSingleAsterisk?: string
  footnoteDoubleAsterisk?: string
  relatedLinksHeading?: string
  fullHistoryLabel?: string
  fullHistoryHref?: string
  factsheetUsdLabel?: string
  factsheetUsdHref?: string
  factsheetChfLabel?: string
  factsheetChfHref?: string
  fundCommentaryLabel?: string
  fundCommentaryHref?: string
  usd?: CMSPerformanceShareClassDetails
  chf?: CMSPerformanceShareClassDetails
}

export type CMSPerformanceShareClassCards = {
  usd: Required<CMSPerformanceShareClassDetails>
  chf: Required<CMSPerformanceShareClassDetails>
}
export type CMSFundPageData = {
  introPrimaryQuote?: string
  introSecondaryQuote?: string
  investmentObjectiveHeading?: string
  investmentObjectiveBody?: string
  relatedLinksHeading?: string
  primaryLabel?: string
  primaryHref?: string
  secondaryLabel?: string
  secondaryHref?: string
  tertiaryLabel?: string
  tertiaryHref?: string
}

type PortfolioChartTuple = [string, string, string, string?]
export type PortfolioStrategyStepItem = {
  heading: string
  body: string
}

export type PortfolioStrategyStep = {
  title: string
  src: string
  items: PortfolioStrategyStepItem[]
}
export type MegatrendDetailBlock = {
  anchor: string
  icon: string
  title: string
  subtitle: string
  description: string[]
  conclusion: string
}

function richTextToParagraphs(richText: unknown): string[] {
  const root = (richText as { root?: { children?: Array<Record<string, unknown>> } } | null)?.root
  const children = Array.isArray(root?.children) ? root.children : []

  return children
    .map((node) => {
      const textChildren = Array.isArray(node?.children)
        ? (node.children as Array<Record<string, unknown>>)
        : []

      return textChildren
        .filter((child) => child?.type === 'text' && typeof child.text === 'string')
        .map((child) => child.text as string)
        .join('')
        .replace(/\s+/g, ' ')
        .trim()
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

function extractHeroCopyFromRichText(richText: unknown): HeroCopy | null {
  const paragraphs = richTextToParagraphs(richText)
  if (paragraphs.length === 0) return null

  // Prefer explicit first-line / second-line split if present.
  if (paragraphs.length >= 2) {
    return { title: paragraphs[0], subtitle: paragraphs[1] }
  }

  const first = paragraphs[0] ?? ''
  if (!first) return null

  // Handle single-line hero copy like:
  // "The IMP ... Fund. Investing in the Forces That Shape Tomorrow."
  const sentenceSplit = first.match(/^(.*?\.)\s+(.+)$/)
  if (sentenceSplit?.[1] && sentenceSplit[2]) {
    return {
      title: sentenceSplit[1].trim().replace(/\.+$/, ''),
      subtitle: sentenceSplit[2].trim().replace(/\.+$/, ''),
    }
  }

  return { title: first.replace(/\.+$/, '') }
}

export async function getCMSHeroCopyBySlug(slug: string): Promise<HeroCopy | null> {
  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'pages',
      limit: 1,
      pagination: false,
      depth: 0,
      where: {
        slug: { equals: slug },
      },
    })

    const page = result.docs?.[0]
    if (!page?.hero) return null
    return extractHeroCopyFromRichText(page.hero.richText)
  } catch {
    return null
  }
}

export async function getCMSFirstContentSectionTextBySlug(slug: string): Promise<string | null> {
  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'pages',
      limit: 1,
      pagination: false,
      depth: 0,
      where: {
        slug: { equals: slug },
      },
    })

    const page = result.docs?.[0] as { layout?: unknown[] } | undefined
    if (!page || !Array.isArray(page.layout)) return null

    for (const block of page.layout) {
      const blockRecord = (block ?? {}) as Record<string, unknown>
      if (blockRecord.blockType !== 'content') continue

      const columns = Array.isArray(blockRecord.columns) ? blockRecord.columns : []
      for (const column of columns) {
        const columnRecord = (column ?? {}) as Record<string, unknown>
        const paragraphs = richTextToParagraphs(columnRecord.richText)
        if (paragraphs.length > 0) {
          return paragraphs.join('\n\n')
        }
      }
    }

    return null
  } catch {
    return null
  }
}

export async function getCMSContentSectionsBySlug(slug: string): Promise<string[]> {
  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'pages',
      limit: 1,
      pagination: false,
      depth: 0,
      where: {
        slug: { equals: slug },
      },
    })

    const page = result.docs?.[0] as { layout?: unknown[] } | undefined
    if (!page || !Array.isArray(page.layout)) return []

    const sections: string[] = []

    for (const block of page.layout) {
      const blockRecord = (block ?? {}) as Record<string, unknown>
      if (blockRecord.blockType !== 'content') continue

      const columns = Array.isArray(blockRecord.columns) ? blockRecord.columns : []
      const columnParagraphs: string[] = []

      for (const column of columns) {
        const columnRecord = (column ?? {}) as Record<string, unknown>
        const paragraphs = richTextToParagraphs(columnRecord.richText)
        if (paragraphs.length > 0) {
          columnParagraphs.push(paragraphs.join('\n\n'))
        }
      }

      if (columnParagraphs.length > 0) {
        sections.push(columnParagraphs.join('\n\n'))
      }
    }

    return sections
  } catch {
    return []
  }
}

export async function getCMSFundIntroQuotes(
  _slug = 'fund',
): Promise<{ first: string; second: string | null } | null> {
  try {
    const payload = await getPayload({ config: configPromise })
    const pageResult = await payload.find({
      collection: 'pages',
      limit: 1,
      pagination: false,
      depth: 0,
      where: {
        slug: { equals: 'fund' },
      },
    })
    const page = pageResult.docs?.[0] as { fundIntroPrimaryQuote?: unknown; fundIntroSecondaryQuote?: unknown } | undefined
    const pagePrimary = typeof page?.fundIntroPrimaryQuote === 'string' ? page.fundIntroPrimaryQuote.trim() : ''
    const pageSecondary =
      typeof page?.fundIntroSecondaryQuote === 'string' ? page.fundIntroSecondaryQuote.trim() : ''
    if (pagePrimary) {
      return {
        first: pagePrimary,
        second: pageSecondary || null,
      }
    }

    const result = await payload.find({
      collection: 'fund-details',
      limit: 1,
      pagination: false,
      depth: 0,
    })

    const doc = result.docs?.[0] as
      | {
          data?: Record<string, unknown> | unknown
          textFields?: Array<{ key?: unknown; value?: unknown }> | null
        }
      | undefined
    if (!doc) return null

    const data = (doc.data && typeof doc.data === 'object' ? doc.data : {}) as Record<string, unknown>

    const getTextFieldValue = (key: string): string | null => {
      if (!Array.isArray(doc.textFields)) return null
      const match = doc.textFields.find((entry) => entry?.key === key)
      if (typeof match?.value === 'string' && match.value.trim()) return match.value.trim()
      return null
    }

    const first =
      (typeof data.introQuotePrimary === 'string' && data.introQuotePrimary.trim()) ||
      getTextFieldValue('introQuotePrimary') ||
      ''
    const secondRaw =
      (typeof data.introQuoteSecondary === 'string' && data.introQuoteSecondary.trim()) ||
      getTextFieldValue('introQuoteSecondary') ||
      null

    if (!first) return null
    return {
      first,
      second: secondRaw,
    }
  } catch {
    return null
  }
}

export async function getCMSFundShareClassMeta(): Promise<FundShareClassMeta | null> {
  try {
    const payload = await getPayload({ config: configPromise })
    const pageResult = await payload.find({
      collection: 'pages',
      limit: 1,
      pagination: false,
      depth: 2,
      where: {
        slug: { equals: 'fund' },
      },
    })

    const initial: FundShareClassMeta = {
      usd: {
        isinLabel: 'ISIN',
        isinValue: '',
        wknLabel: 'WKN',
        wknValue: '',
        bloombergLabel: 'Bloomberg',
        bloombergValue: '',
      },
      chf: {
        isinLabel: 'ISIN',
        isinValue: '',
        wknLabel: 'WKN',
        wknValue: '',
        bloombergLabel: 'Bloomberg',
        bloombergValue: '',
      },
    }

    const linkedDocs = Array.isArray((pageResult.docs?.[0] as { fundAttributes?: unknown } | undefined)?.fundAttributes)
      ? ((pageResult.docs?.[0] as { fundAttributes?: unknown }).fundAttributes as Array<{
          data?: Record<string, unknown> | unknown
          textFields?: Array<{ key?: unknown; value?: unknown }> | null
        }>)
      : []
    const docs =
      linkedDocs.length > 0
        ? linkedDocs
        : (
            await payload.find({
              collection: 'fund-attributes',
              limit: 200,
              pagination: false,
              depth: 0,
            })
          ).docs as Array<{
            data?: Record<string, unknown> | unknown
            textFields?: Array<{ key?: unknown; value?: unknown }> | null
          }>

    const getTextFieldValue = (
      textFields: Array<{ key?: unknown; value?: unknown }> | null | undefined,
      key: string,
    ): string | null => {
      if (!Array.isArray(textFields)) return null
      const match = textFields.find((entry) => entry?.key === key)
      if (typeof match?.value === 'string' && match.value.trim()) return match.value
      return null
    }

    for (const doc of docs) {
      const data = (doc?.data && typeof doc.data === 'object' ? doc.data : {}) as Record<string, unknown>

      const titleRaw =
        (typeof data.title_fld === 'string' ? data.title_fld : null) ??
        getTextFieldValue(doc.textFields, 'title_fld')
      const descriptionRaw =
        (typeof data.description_fld === 'string' ? data.description_fld : null) ??
        getTextFieldValue(doc.textFields, 'description_fld')

      if (!titleRaw || !descriptionRaw) continue

      const title = titleRaw.trim()
      const value = stripHtml(descriptionRaw)
      if (!title || !value) continue

      const normalizedTitle = title.toLowerCase()
      let shareClass: ShareClassIdentity | null = null
      if (normalizedTitle.includes('usd')) shareClass = 'usd'
      if (normalizedTitle.includes('chf')) shareClass = 'chf'
      if (!shareClass) continue

      if (normalizedTitle.includes('isin')) {
        initial[shareClass].isinLabel = title
        initial[shareClass].isinValue = value
      } else if (normalizedTitle.includes('wkn')) {
        initial[shareClass].wknLabel = title
        initial[shareClass].wknValue = value
      } else if (normalizedTitle.includes('bloomberg')) {
        initial[shareClass].bloombergLabel = title
        initial[shareClass].bloombergValue = value
      }
    }

    return initial
  } catch {
    return null
  }
}

function parseFundDetailIcon(value: unknown): FundDetailIcon | null {
  if (typeof value !== 'string') return null
  const normalized = value.trim().toLowerCase()
  if (!normalized) return null

  if (normalized === 'circledollar' || normalized === 'circle-dollar' || normalized === 'circle_dollar')
    return 'circleDollar'
  if (normalized === 'boxes') return 'boxes'
  if (normalized === 'mappincheck' || normalized === 'map-pin-check' || normalized === 'map_pin_check')
    return 'mapPinCheck'
  if (normalized === 'shieldcheck' || normalized === 'shield-check' || normalized === 'shield_check')
    return 'shieldCheck'
  if (
    normalized === 'graduationcap' ||
    normalized === 'graduation-cap' ||
    normalized === 'graduation_cap' ||
    normalized === 'graduation'
  )
    return 'graduationCap'
  if (normalized === 'trendingup' || normalized === 'trending-up' || normalized === 'trending_up')
    return 'trendingUp'

  return null
}

export async function getCMSFundDetails(): Promise<FundDetailItem[] | null> {
  try {
    const payload = await getPayload({ config: configPromise })
    const pageResult = await payload.find({
      collection: 'pages',
      limit: 1,
      pagination: false,
      depth: 2,
      where: {
        slug: { equals: 'fund' },
      },
    })

    const linkedDocs = Array.isArray((pageResult.docs?.[0] as { fundAttributes?: unknown } | undefined)?.fundAttributes)
      ? ((pageResult.docs?.[0] as { fundAttributes?: unknown }).fundAttributes as Array<{ data?: Record<string, unknown> | unknown }>)
      : []
    const docs =
      linkedDocs.length > 0
        ? linkedDocs
        : (await payload.find({
            collection: 'fund-attributes',
            limit: 200,
            pagination: false,
            depth: 0,
          })).docs as Array<{ data?: Record<string, unknown> | unknown }>
    const byLabel = new Map<string, FundDetailItem>()

    for (const doc of docs) {
      const data = (doc?.data && typeof doc.data === 'object' ? doc.data : {}) as Record<string, unknown>
      const titleRaw = typeof data.title_fld === 'string' ? data.title_fld.trim() : ''
      const descriptionRaw = typeof data.description_fld === 'string' ? data.description_fld : ''
      if (!titleRaw || !descriptionRaw) continue

      const value = stripHtml(descriptionRaw)
      if (!value) continue

      const icon =
        parseFundDetailIcon(data.icon_fld) ?? parseFundDetailIcon(data.icon) ?? parseFundDetailIcon(data.iconName)
      if (!icon) continue

      byLabel.set(titleRaw.toLowerCase(), {
        label: titleRaw,
        value,
        icon,
      })
    }

    const preferredOrder = [
      'liquidity',
      'asset classes',
      'regulatory distribution',
      'structure & jurisdiction',
      'sfdr-classification',
    ]

    const details = preferredOrder
      .map((label) => byLabel.get(label))
      .filter((item): item is FundDetailItem => Boolean(item))

    return details.length > 0 ? details : null
  } catch {
    return null
  }
}

export async function getCMSFundPageData(): Promise<CMSFundPageData | null> {
  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'pages',
      limit: 1,
      pagination: false,
      depth: 1,
      where: {
        slug: { equals: 'fund' },
      },
    })
    const page = result.docs?.[0] as
      | {
          fundInvestmentObjectiveHeading?: unknown
          fundInvestmentObjectiveBody?: unknown
          fundRelatedLinksHeading?: unknown
          fundRelatedPrimaryLabel?: unknown
          fundRelatedPrimaryHref?: unknown
          fundRelatedPrimaryAsset?: unknown
          fundRelatedSecondaryLabel?: unknown
          fundRelatedSecondaryHref?: unknown
          fundRelatedSecondaryAsset?: unknown
          fundRelatedTertiaryLabel?: unknown
          fundRelatedTertiaryHref?: unknown
          fundRelatedTertiaryAsset?: unknown
        }
      | undefined
    if (!page) return null

    const getPageText = (value: unknown): string | undefined => {
      if (typeof value !== 'string') return undefined
      const trimmed = value.trim()
      return trimmed.length > 0 ? trimmed : undefined
    }
    const resolveMediaHref = (value: unknown): string | undefined => {
      if (!value || typeof value !== 'object') return undefined
      const media = value as { url?: unknown; filename?: unknown }
      if (typeof media.url === 'string' && media.url.trim()) {
        const normalized = normalizeCMSMediaUrl(media.url.trim())
        if (normalized) return normalized
      }
      if (typeof media.filename === 'string' && media.filename.trim()) {
        const resolved = resolveSupabasePublicMediaUrl(media.filename.trim())
        if (resolved) return resolved
      }
      return undefined
    }

    return {
      investmentObjectiveHeading: getPageText(page.fundInvestmentObjectiveHeading),
      investmentObjectiveBody: getPageText(page.fundInvestmentObjectiveBody),
      relatedLinksHeading: getPageText(page.fundRelatedLinksHeading),
      primaryLabel: getPageText(page.fundRelatedPrimaryLabel),
      primaryHref: getPageText(page.fundRelatedPrimaryHref) ?? resolveMediaHref(page.fundRelatedPrimaryAsset),
      secondaryLabel: getPageText(page.fundRelatedSecondaryLabel),
      secondaryHref: getPageText(page.fundRelatedSecondaryHref) ?? resolveMediaHref(page.fundRelatedSecondaryAsset),
      tertiaryLabel: getPageText(page.fundRelatedTertiaryLabel),
      tertiaryHref: getPageText(page.fundRelatedTertiaryHref) ?? resolveMediaHref(page.fundRelatedTertiaryAsset),
    }
  } catch {
    return null
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

function resolvePayloadApiMediaPath(source: string): string {
  if (!source.startsWith('/api/media/file/')) return ''

  const filename = source.replace('/api/media/file/', '').split('?')[0]?.split('#')[0]?.trim() || ''
  if (!filename) return ''

  return resolveSupabasePublicMediaUrl(filename) || ''
}

function normalizeCMSMediaUrl(source: string): string {
  if (!source) return ''

  if (source.startsWith('/api/media/file/')) {
    return resolvePayloadApiMediaPath(source)
  }
  if (source.startsWith('/')) return source

  if (
    (source.startsWith('http://') || source.startsWith('https://')) &&
    source.includes('/storage/v1/object/public/')
  ) {
    return source
  }

  return ''
}

function normalizeSourceForMediaLookup(source: string): string {
  if (source.startsWith('wix:image://')) {
    const parts = source.replace('wix:image://v1/', '').split('/')
    const fileId = parts[0]
    if (fileId) return `https://static.wixstatic.com/media/${fileId}`
  }
  return source
}

async function resolveCMSImageUrlFromMedia(
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

  const normalizedSource = normalizeSourceForMediaLookup(source)
  let mediaBySource = await payload.find({
    collection: 'media',
    limit: 1,
    pagination: false,
    depth: 0,
    where: {
      or: [{ sourceUrl: { equals: source } }, { sourceUrl: { equals: normalizedSource } }],
    },
  })

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
    return normalizeCMSMediaUrl(mediaUrl.trim())
  }

  return ''
}

function getTextFieldValue(
  textFields: Array<{ key?: unknown; value?: unknown }> | null | undefined,
  key: string,
): string | null {
  if (!Array.isArray(textFields)) return null
  const match = textFields.find((entry) => entry?.key === key)
  if (typeof match?.value === 'string' && match.value.trim()) return match.value.trim()
  return null
}

export async function getCMSMegatrendImageVariantsByTitle(): Promise<
  Record<string, { blue?: string; white?: string }>
> {
  try {
    const payload = await getPayload({ config: configPromise })
    const [detailResult, datasetResult] = await Promise.all([
      payload.find({
        collection: 'megatrends-detail',
        limit: 200,
        pagination: false,
        depth: 0,
      }),
      payload.find({
        collection: 'megatrend-dataset',
        limit: 200,
        pagination: false,
        depth: 0,
      }),
    ])

    const byTitle: Record<string, { blue?: string; white?: string }> = {}

    for (const doc of detailResult.docs as Array<{
      data?: Record<string, unknown> | unknown
      textFields?: Array<{ key?: unknown; value?: unknown }> | null
    }>) {
      const data = (doc?.data && typeof doc.data === 'object' ? doc.data : {}) as Record<string, unknown>
      const title =
        (typeof data.title_fld === 'string' && data.title_fld.trim()) ||
        getTextFieldValue(doc.textFields, 'title_fld')
      const imageSource =
        (typeof data.image_fld === 'string' && data.image_fld.trim()) ||
        getTextFieldValue(doc.textFields, 'image_fld')
      if (!title || !imageSource) continue

      const resolved = await resolveCMSImageUrlFromMedia(payload, imageSource)
      if (!resolved) continue
      byTitle[title] = { ...(byTitle[title] ?? {}), blue: resolved }
    }

    for (const doc of datasetResult.docs as Array<{
      data?: Record<string, unknown> | unknown
      textFields?: Array<{ key?: unknown; value?: unknown }> | null
    }>) {
      const data = (doc?.data && typeof doc.data === 'object' ? doc.data : {}) as Record<string, unknown>
      const title =
        (typeof data.title_fld === 'string' && data.title_fld.trim()) ||
        getTextFieldValue(doc.textFields, 'title_fld')
      const imageSource =
        (typeof data.image_fld === 'string' && data.image_fld.trim()) ||
        getTextFieldValue(doc.textFields, 'image_fld')
      if (!title || !imageSource) continue

      const resolved = await resolveCMSImageUrlFromMedia(payload, imageSource)
      if (!resolved) continue
      byTitle[title] = { ...(byTitle[title] ?? {}), white: resolved }
    }

    return byTitle
  } catch {
    return {}
  }
}

function parseCMSDateToISO(value: unknown): string | null {
  if (!value) return null
  if (typeof value === 'string') {
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return null
    return parsed.toISOString()
  }

  if (typeof value === 'object') {
    const obj = value as { $date?: unknown; date?: unknown }
    const nested = obj.$date ?? obj.date
    if (typeof nested === 'string') {
      const parsed = new Date(nested)
      if (Number.isNaN(parsed.getTime())) return null
      return parsed.toISOString()
    }
  }

  return null
}

function toPerformanceNavPointFromTableDoc(doc: unknown): (PerformanceNavPoint & { shareClass: 'usd' | 'chf' }) | null {
  const record = (doc && typeof doc === 'object' ? doc : {}) as {
    shareClass?: unknown
    asOf?: unknown
    nav?: unknown
  }

  const shareClass = record.shareClass
  if (shareClass !== 'usd' && shareClass !== 'chf') return null

  const nav = record.nav
  if (typeof nav !== 'number' || !Number.isFinite(nav)) return null

  const dateISO = parseCMSDateToISO(record.asOf)
  if (!dateISO) return null

  return {
    shareClass,
    dateISO,
    nav: Math.round(nav * 100) / 100,
  }
}

export async function getCMSPerformanceNavSeries(): Promise<{
  usd: PerformanceNavPoint[]
  chf: PerformanceNavPoint[]
}> {
  try {
    const payload = await getPayload({ config: configPromise })
    const pageResult = await payload.find({
      collection: 'pages',
      limit: 1,
      pagination: false,
      depth: 2,
      where: {
        slug: { equals: 'performance-analysis' },
      },
    })

    const page = pageResult.docs?.[0] as { performanceNavPoints?: unknown } | undefined
    const linkedNavPointDocs = Array.isArray(page?.performanceNavPoints)
      ? (page.performanceNavPoints as unknown[])
      : []

    const pointDocs = linkedNavPointDocs

    if (pointDocs.length > 0) {
      const normalized = pointDocs
        .map((doc) => toPerformanceNavPointFromTableDoc(doc))
        .filter((item): item is PerformanceNavPoint & { shareClass: 'usd' | 'chf' } => Boolean(item))

      const usd = normalized
        .filter((point) => point.shareClass === 'usd')
        .map(({ dateISO, nav }) => ({ dateISO, nav }))
      const chf = normalized
        .filter((point) => point.shareClass === 'chf')
        .map(({ dateISO, nav }) => ({ dateISO, nav }))

      return {
        usd: usd.sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime()),
        chf: chf.sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime()),
      }
    }

    return { usd: [], chf: [] }
  } catch {
    return { usd: [], chf: [] }
  }
}

function formatPercentValue(value: number): string {
  if (!Number.isFinite(value)) return '0'
  const rounded = Math.round(value * 100) / 100
  return rounded.toFixed(2)
}

function parsePortfolioChartDocs(docs: unknown[]): PortfolioChartTuple[] {
  return docs
    .map((doc) => {
      const record = (doc && typeof doc === 'object' ? doc : {}) as {
        name?: unknown
        weight?: unknown
        color?: unknown
        icon?: unknown
        sortOrder?: unknown
      }
      if (typeof record.name !== 'string' || !record.name.trim()) return null
      if (typeof record.weight !== 'number' || !Number.isFinite(record.weight)) return null
      if (typeof record.color !== 'string' || !record.color.trim()) return null
      const sortOrder = typeof record.sortOrder === 'number' && Number.isFinite(record.sortOrder) ? record.sortOrder : 0

      return {
        tuple: [
          record.name.trim(),
          formatPercentValue(record.weight),
          record.color.trim(),
          typeof record.icon === 'string' && record.icon.trim() ? record.icon.trim() : undefined,
        ] as PortfolioChartTuple,
        weight: record.weight,
        sortOrder,
      }
    })
    .filter((item): item is { tuple: PortfolioChartTuple; weight: number; sortOrder: number } => Boolean(item))
    .sort((a, b) => {
      if (b.weight !== a.weight) return b.weight - a.weight
      return a.sortOrder - b.sortOrder
    })
    .map((item) => item.tuple)
}

function isOtherLabel(name: string): boolean {
  const normalized = name.trim().toLowerCase()
  return normalized === 'other' || normalized === 'others'
}

function pickTopHoldings(rows: PortfolioChartTuple[], limit = 10): PortfolioChartTuple[] {
  return rows.filter(([name]) => !isOtherLabel(name)).slice(0, limit)
}

function parsePortfolioInvestmentProcessDocs(docs: unknown[]): string[] {
  return (docs as Array<Record<string, unknown>>)
    .map((doc) => {
      const title = typeof doc.title === 'string' ? doc.title.trim() : ''
      const description = typeof doc.description === 'string' ? doc.description.trim() : ''
      if (!title && !description) return null
      const sortOrder = typeof doc.sortOrder === 'number' && Number.isFinite(doc.sortOrder) ? doc.sortOrder : 0
      const text = /^step\s+\d+$/i.test(title)
        ? description || title
        : !title
          ? description
          : !description
            ? title
            : `${title}: ${description}`
      if (!text) return null
      return { text, sortOrder }
    })
    .filter((item): item is { text: string; sortOrder: number } => Boolean(item))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item) => item.text)
}

export async function getCMSPortfolioStrategyChartData(): Promise<{
  megatrends: PortfolioChartTuple[]
  geographic: PortfolioChartTuple[]
  sectors: PortfolioChartTuple[]
  topHoldings: PortfolioChartTuple[]
}> {
  try {
    const payload = await getPayload({ config: configPromise })
    const pageResult = await payload.find({
      collection: 'pages',
      limit: 1,
      pagination: false,
      depth: 2,
      where: {
        slug: { equals: 'portfolio-strategy' },
      },
    })

    const page = pageResult.docs?.[0] as
      | {
          portfolioMegatrendAllocations?: unknown
          portfolioGeographicAllocations?: unknown
          portfolioSectorAllocations?: unknown
          portfolioTopHoldings?: unknown
        }
      | undefined

    const fromLinkedMegatrends = Array.isArray(page?.portfolioMegatrendAllocations)
      ? parsePortfolioChartDocs(page?.portfolioMegatrendAllocations as unknown[])
      : []
    const fromLinkedGeographic = Array.isArray(page?.portfolioGeographicAllocations)
      ? parsePortfolioChartDocs(page?.portfolioGeographicAllocations as unknown[])
      : []
    const fromLinkedSectors = Array.isArray(page?.portfolioSectorAllocations)
      ? parsePortfolioChartDocs(page?.portfolioSectorAllocations as unknown[])
      : []
    const fromLinkedTopHoldings = Array.isArray(page?.portfolioTopHoldings)
      ? pickTopHoldings(parsePortfolioChartDocs(page?.portfolioTopHoldings as unknown[]), 10)
      : []

    return {
      megatrends: fromLinkedMegatrends,
      geographic: fromLinkedGeographic,
      sectors: fromLinkedSectors,
      topHoldings: fromLinkedTopHoldings,
    }
  } catch {
    return {
      megatrends: [],
      geographic: [],
      sectors: [],
      topHoldings: [],
    }
  }
}

export async function getCMSPortfolioInvestmentProcessItems(): Promise<string[]> {
  try {
    const payload = await getPayload({ config: configPromise })
    const pageResult = await payload.find({
      collection: 'pages',
      limit: 1,
      pagination: false,
      depth: 2,
      where: {
        slug: { equals: 'portfolio-strategy' },
      },
    })

    const page = pageResult.docs?.[0] as { portfolioInvestmentProcessItems?: unknown } | undefined
    const linkedItems = Array.isArray(page?.portfolioInvestmentProcessItems)
      ? parsePortfolioInvestmentProcessDocs(page?.portfolioInvestmentProcessItems as unknown[])
      : []
    return linkedItems
  } catch {
    return []
  }
}

export async function getCMSPortfolioStrategySteps(): Promise<PortfolioStrategyStep[]> {
  try {
    const payload = await getPayload({ config: configPromise })
    const pageResult = await payload.find({
      collection: 'pages',
      limit: 1,
      pagination: false,
      depth: 2,
      where: {
        slug: { equals: 'portfolio-strategy' },
      },
    })
    const portfolioPage = pageResult.docs?.[0]
    if (!portfolioPage?.id) return []

    const parseStepDocs = (docs: Array<Record<string, unknown>>): PortfolioStrategyStep[] =>
      docs
        .map((doc) => {
          const title = typeof doc.title === 'string' ? doc.title.trim() : ''
          if (!title) return null

          const imageDoc = (doc.image && typeof doc.image === 'object'
            ? (doc.image as { url?: unknown; filename?: unknown })
            : null)
          const imageUrlFromMedia =
            imageDoc && typeof imageDoc.url === 'string' && imageDoc.url.trim()
              ? normalizeCMSMediaUrl(imageDoc.url.trim())
              : ''
          const imageUrlFromFilename =
            imageDoc && typeof imageDoc.filename === 'string' && imageDoc.filename.trim()
              ? resolveSupabasePublicMediaUrl(imageDoc.filename.trim()) || ''
              : ''
          const imageSrcText = typeof doc.imageSrc === 'string' ? normalizeCMSMediaUrl(doc.imageSrc.trim()) : ''
          const src = imageUrlFromMedia || imageUrlFromFilename || imageSrcText
          if (!src) return null

          const items = Array.isArray(doc.items)
            ? (doc.items as Array<Record<string, unknown>>)
                .map((item) => {
                  const heading = typeof item.heading === 'string' ? item.heading.trim() : ''
                  const body = typeof item.body === 'string' ? item.body.trim() : ''
                  const sortOrder =
                    typeof item.sortOrder === 'number' && Number.isFinite(item.sortOrder) ? item.sortOrder : 0
                  if (!heading || !body) return null
                  return { heading, body, sortOrder }
                })
                .filter((item): item is { heading: string; body: string; sortOrder: number } => Boolean(item))
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((item) => ({ heading: item.heading, body: item.body }))
            : []

          if (items.length === 0) return null

          return {
            step: { title, src, items },
            sortOrder: typeof doc.sortOrder === 'number' && Number.isFinite(doc.sortOrder) ? doc.sortOrder : 0,
          }
        })
        .filter((step): step is { step: PortfolioStrategyStep; sortOrder: number } => Boolean(step))
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((item) => item.step)

    const linkedStepsRaw = (portfolioPage as { portfolioStrategySteps?: unknown }).portfolioStrategySteps
    const linkedSteps = Array.isArray(linkedStepsRaw)
      ? parseStepDocs(
          linkedStepsRaw.filter((entry): entry is Record<string, unknown> => Boolean(entry && typeof entry === 'object')),
        )
      : []
    return linkedSteps
  } catch {
    return []
  }
}

export async function getCMSMegatrendDetailBlocks(): Promise<MegatrendDetailBlock[]> {
  try {
    const payload = await getPayload({ config: configPromise })
    const pageResult = await payload.find({
      collection: 'pages',
      limit: 1,
      pagination: false,
      depth: 2,
      where: {
        slug: { equals: 'megatrends' },
      },
    })
    const page = pageResult.docs?.[0] as { megatrendDetailBlocks?: unknown } | undefined
    const linkedBlocksRaw = Array.isArray(page?.megatrendDetailBlocks)
      ? (page.megatrendDetailBlocks as Array<Record<string, unknown>>)
      : []

    return linkedBlocksRaw
      .map((doc) => {
        const anchor = typeof doc.anchor === 'string' ? doc.anchor.trim() : ''
        const title = typeof doc.title === 'string' ? doc.title.trim() : ''
        const subtitle = typeof doc.subtitle === 'string' ? doc.subtitle.trim() : ''
        const conclusion = typeof doc.conclusion === 'string' ? doc.conclusion.trim() : ''
        const sortOrder = typeof doc.sortOrder === 'number' && Number.isFinite(doc.sortOrder) ? doc.sortOrder : 0
        if (!anchor || !title || !subtitle || !conclusion) return null

        const imageDoc = (doc.image && typeof doc.image === 'object'
          ? (doc.image as { url?: unknown; filename?: unknown })
          : null)
        const imageUrlFromMedia =
          imageDoc && typeof imageDoc.url === 'string' && imageDoc.url.trim()
            ? normalizeCMSMediaUrl(imageDoc.url.trim())
            : ''
        const imageUrlFromFilename =
          imageDoc && typeof imageDoc.filename === 'string' && imageDoc.filename.trim()
            ? resolveSupabasePublicMediaUrl(imageDoc.filename.trim()) || ''
            : ''
        const imageSrcText = typeof doc.imageSrc === 'string' ? normalizeCMSMediaUrl(doc.imageSrc.trim()) : ''
        const icon = imageUrlFromMedia || imageUrlFromFilename || imageSrcText
        if (!icon) return null

        const description = Array.isArray(doc.description)
          ? (doc.description as Array<Record<string, unknown>>)
              .map((item) => {
                const text = typeof item.text === 'string' ? item.text.trim() : ''
                const sortOrder =
                  typeof item.sortOrder === 'number' && Number.isFinite(item.sortOrder) ? item.sortOrder : 0
                if (!text) return null
                return { text, sortOrder }
              })
              .filter((item): item is { text: string; sortOrder: number } => Boolean(item))
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((item) => item.text)
          : []
        if (description.length === 0) return null

        return {
          sortOrder,
          block: {
            anchor,
            icon,
            title,
            subtitle,
            description,
            conclusion,
          },
        }
      })
      .filter((item): item is { sortOrder: number; block: MegatrendDetailBlock } => Boolean(item))
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item) => item.block)
  } catch {
    return []
  }
}

function getDataString(data: Record<string, unknown>, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = data[key]
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }
  return null
}

function normalizePercent(value: string | null): string | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  if (trimmed.includes('%')) return trimmed
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return `${trimmed}%`
  return trimmed
}

function normalizeAsOfDate(value: string | null): string | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(trimmed)) return trimmed

  const parsed = new Date(trimmed)
  if (Number.isNaN(parsed.getTime())) return trimmed
  const dd = String(parsed.getUTCDate()).padStart(2, '0')
  const mm = String(parsed.getUTCMonth() + 1).padStart(2, '0')
  const yyyy = String(parsed.getUTCFullYear())
  return `${dd}.${mm}.${yyyy}`
}

function buildPerformanceFundDetails(
  data: Record<string, unknown>,
  variant: ShareClassIdentity,
): Array<[string, string]> {
  const valueSuffix = variant === 'usd' ? '' : '2'
  const dateSuffix = variant === 'usd' ? '' : '1'

  const rows: Array<{ label: string | null; value: string | null }> = [
    { label: getDataString(data, 'liquidity1', 'Liquidity'), value: getDataString(data, `liquidity${valueSuffix}`) },
    { label: getDataString(data, 'tradeDay1', 'Trade Day'), value: getDataString(data, `tradeDay${valueSuffix}`) },
    { label: getDataString(data, 'settlement1', 'Settlement'), value: getDataString(data, `settlement${valueSuffix}`) },
    {
      label: getDataString(data, 'cutoffSubscription1', 'Cut-off Subscription & Redemption (Trade Day)'),
      value: getDataString(data, `cutoffSubscription${valueSuffix}`),
    },
    { label: getDataString(data, 'allInFee1', 'All-In Fee'), value: getDataString(data, `allInFee${valueSuffix}`) },
    {
      label: getDataString(data, 'managementFee1', 'Management Fee'),
      value: getDataString(data, `managementFee${valueSuffix}`),
    },
    {
      label: getDataString(data, 'administrativeFees1', 'Administrative Fees'),
      value: getDataString(data, `administrativeFees${valueSuffix}`),
    },
    {
      label: getDataString(data, 'performanceFee1', 'Performance Fee'),
      value: getDataString(data, `performanceFee${valueSuffix}`),
    },
    {
      label: getDataString(data, 'crystallizationFreq1', 'Crystallization Freq.'),
      value: getDataString(data, `crystallizationFreq${valueSuffix}`),
    },
    {
      label: getDataString(data, 'subscriptionFee1', 'Subscription Fee'),
      value: getDataString(data, `subscriptionFee${valueSuffix}`),
    },
    {
      label: getDataString(data, 'redemptionFee1', 'Redemption Fee'),
      value: getDataString(data, `redemptionFee${valueSuffix}`),
    },
    {
      label: getDataString(data, 'inceptionDateTitle', 'Inception Date'),
      value: getDataString(data, `inceptionDateValue${dateSuffix}`),
    },
    {
      label: getDataString(data, 'fundCurrencyText', 'Fund Currency'),
      value: getDataString(data, `fundCurrencyValue${dateSuffix}`),
    },
    {
      label: getDataString(data, 'inceptionPriceText', 'Inception Price'),
      value: getDataString(data, `inceptionPriceValue${dateSuffix}`),
    },
    {
      label: getDataString(data, 'minInvestmentText', 'Min. Investment'),
      value: getDataString(data, `minInvestmentValue${dateSuffix}`),
    },
  ]

  return rows
    .filter((row): row is { label: string; value: string } => Boolean(row.label && row.value))
    .map((row) => [row.label, row.value])
}

function buildPerformanceShareClass(
  data: Record<string, unknown>,
  variant: ShareClassIdentity,
): CMSPerformanceShareClassDetails {
  const valueSuffix = variant === 'usd' ? '' : '2'
  const dateSuffix = variant === 'usd' ? '' : '1'

  return {
    nav: getDataString(data, `navPerShare${valueSuffix}`) ?? undefined,
    perfYTD: normalizePercent(getDataString(data, `performanceYtd${valueSuffix}`)),
    asOf: normalizeAsOfDate(getDataString(data, `dateUsdNew${dateSuffix}`, `date${dateSuffix}`)),
    sharpe: getDataString(data, `sharpeRatio${valueSuffix}`) ?? undefined,
    volatility: getDataString(data, `volatility${valueSuffix}`) ?? undefined,
    sortino: getDataString(data, `sortinoRatio${valueSuffix}`) ?? undefined,
    downsideRisk: getDataString(data, `downsideRisk${valueSuffix}`) ?? undefined,
    fundDetails: buildPerformanceFundDetails(data, variant),
  }
}

export async function getCMSPerformancePageData(): Promise<CMSPerformancePageData | null> {
  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'pages',
      limit: 1,
      pagination: false,
      depth: 1,
      where: {
        slug: { equals: 'performance-analysis' },
      },
    })

    const page = result.docs?.[0] as
      | {
          performanceHeroTitle?: unknown
          performanceAnnualTitle?: unknown
          performanceUsdLabel?: unknown
          performanceChfLabel?: unknown
          performanceExportSvgTooltip?: unknown
          performanceExportCsvTooltip?: unknown
          performanceChartYearBadge?: unknown
          performanceCardsNavUpdatesTitle?: unknown
          performanceCardsNavPerShareLabel?: unknown
          performanceCardsPerformanceMetricsTitle?: unknown
          performanceCardsAsOfPrefix?: unknown
          performanceCardsPerformanceYtdLabel?: unknown
          performanceCardsRiskMetricsTitle?: unknown
          performanceCardsSharpeRatioLabel?: unknown
          performanceCardsVolatilityLabel?: unknown
          performanceCardsSortinoRatioLabel?: unknown
          performanceCardsDownsideRiskLabel?: unknown
          performanceCardsFundDetailsTitle?: unknown
          performanceFootnoteSingleAsterisk?: unknown
          performanceFootnoteDoubleAsterisk?: unknown
          performanceRelatedLinksHeading?: unknown
          performanceFullHistoryLabel?: unknown
          performanceFullHistoryHref?: unknown
          performanceFactsheetUsdLabel?: unknown
          performanceFactsheetUsdAsset?: unknown
          performanceFactsheetUsdHref?: unknown
          performanceFactsheetChfLabel?: unknown
          performanceFactsheetChfAsset?: unknown
          performanceFactsheetChfHref?: unknown
          performanceFundCommentaryLabel?: unknown
          performanceFundCommentaryAsset?: unknown
          performanceFundCommentaryHref?: unknown
        }
      | undefined
    if (!page) return null

    const getPageText = (value: unknown): string | undefined => {
      if (typeof value !== 'string') return undefined
      const trimmed = value.trim()
      return trimmed.length > 0 ? trimmed : undefined
    }

    const resolveMediaHref = (value: unknown): string | undefined => {
      if (!value || typeof value !== 'object') return undefined
      const media = value as { url?: unknown; filename?: unknown }

      if (typeof media.url === 'string' && media.url.trim()) {
        const normalized = normalizeCMSMediaUrl(media.url.trim())
        if (normalized) return normalized
      }

      if (typeof media.filename === 'string' && media.filename.trim()) {
        const resolved = resolveSupabasePublicMediaUrl(media.filename.trim())
        if (resolved) return resolved
      }

      return undefined
    }

    return {
      pageTitle: getPageText(page.performanceHeroTitle),
      annualPerformanceTitle: getPageText(page.performanceAnnualTitle),
      usdLabel: getPageText(page.performanceUsdLabel),
      chfLabel: getPageText(page.performanceChfLabel),
      exportSvgTooltip: getPageText(page.performanceExportSvgTooltip),
      exportCsvTooltip: getPageText(page.performanceExportCsvTooltip),
      chartYearBadge: getPageText(page.performanceChartYearBadge),
      navUpdatesTitle: getPageText(page.performanceCardsNavUpdatesTitle),
      navPerShareLabel: getPageText(page.performanceCardsNavPerShareLabel),
      performanceMetricsTitle: getPageText(page.performanceCardsPerformanceMetricsTitle),
      asOfPrefix: getPageText(page.performanceCardsAsOfPrefix),
      performanceYtdLabel: getPageText(page.performanceCardsPerformanceYtdLabel),
      riskMetricsTitle: getPageText(page.performanceCardsRiskMetricsTitle),
      sharpeRatioLabel: getPageText(page.performanceCardsSharpeRatioLabel),
      volatilityLabel: getPageText(page.performanceCardsVolatilityLabel),
      sortinoRatioLabel: getPageText(page.performanceCardsSortinoRatioLabel),
      downsideRiskLabel: getPageText(page.performanceCardsDownsideRiskLabel),
      fundDetailsTitle: getPageText(page.performanceCardsFundDetailsTitle),
      footnoteSingleAsterisk: getPageText(page.performanceFootnoteSingleAsterisk),
      footnoteDoubleAsterisk: getPageText(page.performanceFootnoteDoubleAsterisk),
      relatedLinksHeading: getPageText(page.performanceRelatedLinksHeading),
      fullHistoryLabel: getPageText(page.performanceFullHistoryLabel),
      fullHistoryHref: getPageText(page.performanceFullHistoryHref),
      factsheetUsdLabel: getPageText(page.performanceFactsheetUsdLabel),
      factsheetUsdHref: getPageText(page.performanceFactsheetUsdHref) ?? resolveMediaHref(page.performanceFactsheetUsdAsset),
      factsheetChfLabel: getPageText(page.performanceFactsheetChfLabel),
      factsheetChfHref: getPageText(page.performanceFactsheetChfHref) ?? resolveMediaHref(page.performanceFactsheetChfAsset),
      fundCommentaryLabel: getPageText(page.performanceFundCommentaryLabel),
      fundCommentaryHref:
        getPageText(page.performanceFundCommentaryHref) ?? resolveMediaHref(page.performanceFundCommentaryAsset),
    }
  } catch {
    return null
  }
}

function emptyPerformanceShareClassDetails(): Required<CMSPerformanceShareClassDetails> {
  return {
    nav: '',
    perfYTD: '',
    asOf: '',
    sharpe: '',
    volatility: '',
    sortino: '',
    downsideRisk: '',
    fundDetails: [],
  }
}

function parseShareClassCardDoc(doc: unknown): Required<CMSPerformanceShareClassDetails> {
  const record = (doc && typeof doc === 'object' ? doc : {}) as {
    nav?: unknown
    perfYTD?: unknown
    asOf?: unknown
    sharpe?: unknown
    volatility?: unknown
    sortino?: unknown
    downsideRisk?: unknown
    fundDetails?: unknown
  }

  const parseText = (value: unknown): string => (typeof value === 'string' ? value.trim() : '')
  const fundDetails = Array.isArray(record.fundDetails)
    ? (record.fundDetails as Array<Record<string, unknown>>)
        .map((row) => {
          const label = parseText(row.label)
          const value = parseText(row.value)
          const sortOrder = typeof row.sortOrder === 'number' && Number.isFinite(row.sortOrder) ? row.sortOrder : 0
          if (!label || !value) return null
          return { label, value, sortOrder }
        })
        .filter((row): row is { label: string; value: string; sortOrder: number } => Boolean(row))
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((row) => [row.label, row.value] as [string, string])
    : []

  return {
    nav: parseText(record.nav),
    perfYTD: parseText(record.perfYTD),
    asOf: parseText(record.asOf),
    sharpe: parseText(record.sharpe),
    volatility: parseText(record.volatility),
    sortino: parseText(record.sortino),
    downsideRisk: parseText(record.downsideRisk),
    fundDetails,
  }
}

export async function getCMSPerformanceShareClassCards(): Promise<CMSPerformanceShareClassCards> {
  try {
    const payload = await getPayload({ config: configPromise })
    const pageResult = await payload.find({
      collection: 'pages',
      limit: 1,
      pagination: false,
      depth: 2,
      where: {
        slug: { equals: 'performance-analysis' },
      },
    })

    const page = pageResult.docs?.[0] as
      | {
          performanceUsdShareClassData?: unknown
          performanceChfShareClassData?: unknown
        }
      | undefined

    const linkedUsdDoc =
      page?.performanceUsdShareClassData && typeof page.performanceUsdShareClassData === 'object'
        ? page.performanceUsdShareClassData
        : null
    const linkedChfDoc =
      page?.performanceChfShareClassData && typeof page.performanceChfShareClassData === 'object'
        ? page.performanceChfShareClassData
        : null

    return {
      usd: linkedUsdDoc
        ? parseShareClassCardDoc(linkedUsdDoc)
        : emptyPerformanceShareClassDetails(),
      chf: linkedChfDoc
        ? parseShareClassCardDoc(linkedChfDoc)
        : emptyPerformanceShareClassDetails(),
    }
  } catch {
    return {
      usd: emptyPerformanceShareClassDetails(),
      chf: emptyPerformanceShareClassDetails(),
    }
  }
}
