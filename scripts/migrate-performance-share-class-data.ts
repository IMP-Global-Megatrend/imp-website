// @ts-nocheck
import dotenv from 'dotenv'
import path from 'node:path'
import fallbacks from '@/constants/fallbacks.json'
import { createWixClient } from '@/endpoints/wix-import/source-client'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

type ShareClassInput = {
  name: string
  nav: string
  perfYTD: string
  asOf: string
  sharpe: string
  volatility: string
  sortino: string
  downsideRisk: string
  fundDetails: Array<[string, string]>
}

const SOURCE_MODE = String(process.env.WIX_PERFORMANCE_SOURCE || 'wix')
  .trim()
  .toLowerCase()

function getDataString(data: Record<string, unknown>, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = data[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return null
}

function normalizePercent(value: string | null): string {
  if (!value) return ''
  const trimmed = value.trim()
  if (!trimmed) return ''
  return trimmed.includes('%') ? trimmed : `${trimmed}%`
}

function normalizeAsOfDate(value: string | null): string {
  if (!value) return ''
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (/^\d{2}\.\d{2}\.\d{4}$/u.test(trimmed)) return trimmed

  const parsed = new Date(trimmed)
  if (Number.isNaN(parsed.getTime())) return trimmed
  const dd = String(parsed.getUTCDate()).padStart(2, '0')
  const mm = String(parsed.getUTCMonth() + 1).padStart(2, '0')
  const yyyy = String(parsed.getUTCFullYear())
  return `${dd}.${mm}.${yyyy}`
}

function buildFundDetailsFromWixData(
  data: Record<string, unknown>,
  variant: 'usd' | 'chf',
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

function normalizeShareClassInputFromWix(data: Record<string, unknown>, variant: 'usd' | 'chf'): ShareClassInput {
  const valueSuffix = variant === 'usd' ? '' : '2'
  const dateSuffix = variant === 'usd' ? '' : '1'
  const name = variant === 'usd' ? 'USD Share Class' : 'CHF Hedged Share Class'

  return {
    name,
    nav: (getDataString(data, `navPerShare${valueSuffix}`) || '').trim(),
    perfYTD: normalizePercent(getDataString(data, `performanceYtd${valueSuffix}`)),
    asOf: normalizeAsOfDate(getDataString(data, `dateUsdNew${dateSuffix}`, `date${dateSuffix}`)),
    sharpe: (getDataString(data, `sharpeRatio${valueSuffix}`) || '').trim(),
    volatility: (getDataString(data, `volatility${valueSuffix}`) || '').trim(),
    sortino: (getDataString(data, `sortinoRatio${valueSuffix}`) || '').trim(),
    downsideRisk: (getDataString(data, `downsideRisk${valueSuffix}`) || '').trim(),
    fundDetails: buildFundDetailsFromWixData(data, variant),
  }
}

function normalizeShareClassInput(
  name: string,
  cmsData: {
    nav?: string
    perfYTD?: string
    asOf?: string
    sharpe?: string
    volatility?: string
    sortino?: string
    downsideRisk?: string
    fundDetails?: Array<[string, string]>
  } | null | undefined,
  fallbackData: {
    nav: string
    perfYTD: string
    asOf: string
    sharpe: string
    volatility: string
    sortino: string
    downsideRisk: string
    fundDetails: Array<[string, string]>
  },
): ShareClassInput {
  return {
    name,
    nav: (cmsData?.nav || fallbackData.nav || '').trim(),
    perfYTD: (cmsData?.perfYTD || fallbackData.perfYTD || '').trim(),
    asOf: (cmsData?.asOf || fallbackData.asOf || '').trim(),
    sharpe: (cmsData?.sharpe || fallbackData.sharpe || '').trim(),
    volatility: (cmsData?.volatility || fallbackData.volatility || '').trim(),
    sortino: (cmsData?.sortino || fallbackData.sortino || '').trim(),
    downsideRisk: (cmsData?.downsideRisk || fallbackData.downsideRisk || '').trim(),
    fundDetails: (cmsData?.fundDetails?.length ? cmsData.fundDetails : fallbackData.fundDetails).map((row) => [
      (row[0] || '').trim(),
      (row[1] || '').trim(),
    ]),
  }
}

async function upsertShareClassDoc(args: {
  payload: Awaited<ReturnType<(typeof import('payload'))['getPayload']>>
  collection: 'performance-usd-share-class-data' | 'performance-chf-share-class-data'
  data: ShareClassInput
}) {
  const existingResult = await args.payload.find({
    collection: args.collection,
    limit: 1,
    pagination: false,
    depth: 0,
  })

  const docData = {
    name: args.data.name,
    nav: args.data.nav,
    perfYTD: args.data.perfYTD,
    asOf: args.data.asOf,
    sharpe: args.data.sharpe,
    volatility: args.data.volatility,
    sortino: args.data.sortino,
    downsideRisk: args.data.downsideRisk,
    fundDetails: args.data.fundDetails.map(([label, value], index) => ({
      label,
      value,
      sortOrder: index + 1,
    })),
  }

  const existing = existingResult.docs?.[0]
  if (!existing) {
    await args.payload.create({
      collection: args.collection,
      depth: 0,
      data: docData,
    })
    return 'created'
  }

  const same =
    existing.name === docData.name &&
    existing.nav === docData.nav &&
    existing.perfYTD === docData.perfYTD &&
    existing.asOf === docData.asOf &&
    existing.sharpe === docData.sharpe &&
    existing.volatility === docData.volatility &&
    existing.sortino === docData.sortino &&
    existing.downsideRisk === docData.downsideRisk &&
    JSON.stringify(existing.fundDetails || []) === JSON.stringify(docData.fundDetails)

  if (same) return 'unchanged'

  await args.payload.update({
    collection: args.collection,
    id: existing.id,
    depth: 0,
    data: docData,
  })
  return 'updated'
}

async function main() {
  const [{ default: config }, { getPayload }] = await Promise.all([
    import('@payload-config'),
    import('payload'),
  ])
  const payload = await getPayload({ config })

  let usdInput: ShareClassInput
  let chfInput: ShareClassInput
  if (SOURCE_MODE === 'wix') {
    const wix = createWixClient()
    const items = await wix.getLatestDataCollectionItems('FundDetails', { limit: 1 })
    const source = (items[0]?.data && typeof items[0].data === 'object'
      ? items[0].data
      : {}) as Record<string, unknown>
    if (!items[0] || Object.keys(source).length === 0) {
      throw new Error('No Wix FundDetails row found for performance share-class sync.')
    }

    usdInput = normalizeShareClassInputFromWix(source, 'usd')
    chfInput = normalizeShareClassInputFromWix(source, 'chf')
  } else {
    const { getCMSPerformancePageData } = await import('@/app/(frontend)/_components/getCMSPageBySlug')
    const pageData = await getCMSPerformancePageData()
    const usdFallback = {
      ...fallbacks.performance.shareClassDetails.usd,
      fundDetails: fallbacks.performance.shareClassDetails.usd.fundDetails as Array<[string, string]>,
    }
    const chfFallback = {
      ...fallbacks.performance.shareClassDetails.chf,
      fundDetails: fallbacks.performance.shareClassDetails.chf.fundDetails as Array<[string, string]>,
    }

    usdInput = normalizeShareClassInput('USD Share Class', pageData?.usd, usdFallback)
    chfInput = normalizeShareClassInput('CHF Hedged Share Class', pageData?.chf, chfFallback)
  }

  const [usdResult, chfResult] = await Promise.all([
    upsertShareClassDoc({
      payload,
      collection: 'performance-usd-share-class-data',
      data: usdInput,
    }),
    upsertShareClassDoc({
      payload,
      collection: 'performance-chf-share-class-data',
      data: chfInput,
    }),
  ])

  console.log(
    JSON.stringify(
      {
        sourceMode: SOURCE_MODE,
        usd: usdResult,
        chf: chfResult,
      },
      null,
      2,
    ),
  )
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
