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
      depth: 0,
      where: {
        slug: { equals: 'about-us' },
      },
    })

    const page = result.docs?.[0] as { aboutUsVideoUrl?: unknown } | undefined
    if (typeof page?.aboutUsVideoUrl === 'string' && page.aboutUsVideoUrl.trim()) {
      return page.aboutUsVideoUrl.trim()
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
  usd?: CMSPerformanceShareClassDetails
  chf?: CMSPerformanceShareClassDetails
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
    const result = await payload.find({
      collection: 'wix-fund-details',
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
    const result = await payload.find({
      collection: 'wix-fund-attributes',
      limit: 200,
      pagination: false,
      depth: 0,
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

    const docs = result.docs as Array<{
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
    const result = await payload.find({
      collection: 'wix-fund-attributes',
      limit: 200,
      pagination: false,
      depth: 0,
    })

    const docs = result.docs as Array<{ data?: Record<string, unknown> | unknown }>
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
  if (source.startsWith('/')) return source

  if (
    (source.startsWith('http://') || source.startsWith('https://')) &&
    source.includes('/storage/v1/object/public/')
  ) {
    return source
  }

  const normalizedSource = normalizeSourceForMediaLookup(source)
  const mediaBySource = await payload.find({
    collection: 'media',
    limit: 1,
    pagination: false,
    depth: 0,
    where: {
      or: [{ sourceUrl: { equals: source } }, { sourceUrl: { equals: normalizedSource } }],
    },
  })

  const mediaDoc = mediaBySource.docs?.[0] as { url?: unknown; filename?: unknown } | undefined
  const mediaFilename = mediaDoc?.filename
  if (typeof mediaFilename === 'string' && mediaFilename.trim() !== '') {
    const supabaseMediaUrl = resolveSupabasePublicMediaUrl(mediaFilename)
    if (supabaseMediaUrl) return supabaseMediaUrl
  }

  const mediaUrl = mediaDoc?.url
  if (typeof mediaUrl === 'string' && mediaUrl.trim() !== '') {
    return mediaUrl
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
        collection: 'wix-megatrends-detail',
        limit: 200,
        pagination: false,
        depth: 0,
      }),
      payload.find({
        collection: 'wix-megatrend-dataset',
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

function toPerformanceNavPoint(doc: unknown): PerformanceNavPoint | null {
  const record = (doc && typeof doc === 'object' ? doc : {}) as {
    data?: Record<string, unknown> | unknown
    numberFields?: Array<{ key?: unknown; value?: unknown }> | null
    dateFields?: Array<{ key?: unknown; value?: unknown }> | null
  }

  const data = (record.data && typeof record.data === 'object' ? record.data : {}) as Record<string, unknown>

  const directNav = typeof data.valuation === 'number' ? data.valuation : null
  const numberFieldNav = Array.isArray(record.numberFields)
    ? record.numberFields.find((entry) => entry?.key === 'valuation' && typeof entry.value === 'number')
    : null
  const nav = directNav ?? (typeof numberFieldNav?.value === 'number' ? numberFieldNav.value : null)
  if (typeof nav !== 'number' || !Number.isFinite(nav)) return null

  const directDate = parseCMSDateToISO(data.date)
  const dateFieldValue = Array.isArray(record.dateFields)
    ? record.dateFields.find((entry) => entry?.key === 'date')?.value
    : null
  const dateISO = directDate ?? parseCMSDateToISO(dateFieldValue)
  if (!dateISO) return null

  return { dateISO, nav: Math.round(nav * 100) / 100 }
}

export async function getCMSPerformanceNavSeries(): Promise<{
  usd: PerformanceNavPoint[]
  chf: PerformanceNavPoint[]
}> {
  try {
    const payload = await getPayload({ config: configPromise })

    const [usdResult, chfResult] = await Promise.all([
      payload.find({
        collection: 'wix-import-usd',
        limit: 300,
        pagination: false,
        depth: 0,
      }),
      payload.find({
        collection: 'wix-import-chf',
        limit: 300,
        pagination: false,
        depth: 0,
      }),
    ])

    const parseSeries = (docs: unknown[]): PerformanceNavPoint[] => {
      return docs
        .map((doc) => toPerformanceNavPoint(doc))
        .filter((item): item is PerformanceNavPoint => Boolean(item))
        .sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime())
    }

    return {
      usd: parseSeries(usdResult.docs as unknown[]),
      chf: parseSeries(chfResult.docs as unknown[]),
    }
  } catch {
    return { usd: [], chf: [] }
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
      collection: 'wix-fund-details',
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
    const getFromDataOrTextFields = (...keys: string[]): string | undefined => {
      const fromData = getDataString(data, ...keys)
      if (fromData) return fromData

      for (const key of keys) {
        const fromTextFields = getTextFieldValue(doc.textFields, key)
        if (fromTextFields) return fromTextFields
      }

      return undefined
    }

    const usd = buildPerformanceShareClass(data, 'usd')
    const chf = buildPerformanceShareClass(data, 'chf')

    return {
      pageTitle: getFromDataOrTextFields('pageTitle'),
      annualPerformanceTitle: getFromDataOrTextFields('annualPerformanceTitle'),
      usdLabel: getFromDataOrTextFields('usd'),
      chfLabel: getFromDataOrTextFields('chf'),
      exportSvgTooltip: getFromDataOrTextFields('exportSvgTooltip', 'exportSvgLabel'),
      exportCsvTooltip: getFromDataOrTextFields('exportCsvTooltip', 'exportCsvLabel'),
      usd,
      chf,
    }
  } catch {
    return null
  }
}
