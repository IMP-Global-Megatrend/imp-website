// @ts-nocheck
import dotenv from 'dotenv'
import path from 'node:path'
import fallbacks from '@/constants/fallbacks.json'
import performanceContent from '@/constants/performance-analysis-content.json'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const SYNC_MODE = String(process.env.PERFORMANCE_PAGE_SYNC_MODE || 'full')
  .trim()
  .toLowerCase()

function getTextFieldValue(
  textFields: Array<{ key?: unknown; value?: unknown }> | null | undefined,
  key: string,
): string | null {
  if (!Array.isArray(textFields)) return null
  const match = textFields.find((entry) => entry?.key === key)
  if (typeof match?.value === 'string' && match.value.trim()) return match.value.trim()
  return null
}

function getDataString(data: Record<string, unknown>, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = data[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return null
}

async function main() {
  const [{ default: config }, { getPayload }] = await Promise.all([
    import('@payload-config'),
    import('payload'),
  ])
  const payload = await getPayload({ config })

  const [pageResult, fundDetailsResult, homePageResult, navPointsResult, usdShareClassResult, chfShareClassResult] =
    await Promise.all([
    payload.find({
      collection: 'pages',
      where: { slug: { equals: 'performance-analysis' } },
      limit: 1,
      pagination: false,
      depth: 0,
    }),
    payload.find({
      collection: 'fund-details',
      limit: 1,
      pagination: false,
      depth: 0,
    }),
    payload.find({
      collection: 'pages',
      where: { slug: { equals: 'home' } },
      limit: 1,
      pagination: false,
      depth: 0,
    }),
    payload.find({
      collection: 'performance-nav-points',
      limit: 2000,
      pagination: false,
      depth: 0,
      sort: 'asOf',
    }),
    payload.find({
      collection: 'performance-usd-share-class-data',
      limit: 1,
      pagination: false,
      depth: 0,
    }),
    payload.find({
      collection: 'performance-chf-share-class-data',
      limit: 1,
      pagination: false,
      depth: 0,
    }),
    ])

  const page = pageResult.docs?.[0]
  if (!page) throw new Error('performance-analysis page not found.')

  const sourceDoc = fundDetailsResult.docs?.[0] as
    | {
        data?: Record<string, unknown> | unknown
        textFields?: Array<{ key?: unknown; value?: unknown }> | null
      }
    | undefined
  const sourceData = (sourceDoc?.data && typeof sourceDoc.data === 'object'
    ? sourceDoc.data
    : {}) as Record<string, unknown>
  const sourceTextFields = sourceDoc?.textFields
  const homePage = homePageResult.docs?.[0] as
    | {
        homeDownloads?: {
          factsheetUsd?: unknown
          factsheetChfHedged?: unknown
          fundCommentary?: unknown
        }
      }
    | undefined

  const performanceHeroTitle =
    getDataString(sourceData, 'pageTitle') ||
    getTextFieldValue(sourceTextFields, 'pageTitle') ||
    fallbacks.performance.labels.heroTitle
  const performanceAnnualTitle =
    getDataString(sourceData, 'annualPerformanceTitle') ||
    getTextFieldValue(sourceTextFields, 'annualPerformanceTitle') ||
    fallbacks.performance.labels.performanceTitle
  const performanceUsdLabel =
    getDataString(sourceData, 'usd') ||
    getTextFieldValue(sourceTextFields, 'usd') ||
    fallbacks.performance.labels.usdTitle
  const performanceChfLabel =
    getDataString(sourceData, 'chf') ||
    getTextFieldValue(sourceTextFields, 'chf') ||
    fallbacks.performance.labels.chfTitle
  const performanceExportSvgTooltip =
    getDataString(sourceData, 'exportSvgTooltip', 'exportSvgLabel') ||
    getTextFieldValue(sourceTextFields, 'exportSvgTooltip') ||
    getTextFieldValue(sourceTextFields, 'exportSvgLabel') ||
    'Export SVG'
  const performanceExportCsvTooltip =
    getDataString(sourceData, 'exportCsvTooltip', 'exportCsvLabel') ||
    getTextFieldValue(sourceTextFields, 'exportCsvTooltip') ||
    getTextFieldValue(sourceTextFields, 'exportCsvLabel') ||
    'Export CSV'
  const performanceFactsheetUsdAsset = homePage?.homeDownloads?.factsheetUsd
  const performanceFactsheetChfAsset = homePage?.homeDownloads?.factsheetChfHedged
  const performanceFundCommentaryAsset = homePage?.homeDownloads?.fundCommentary
  const performanceNavPoints = (navPointsResult.docs || []).map((doc) => doc.id).filter(Boolean)
  const performanceUsdShareClassData = usdShareClassResult.docs?.[0]?.id
  const performanceChfShareClassData = chfShareClassResult.docs?.[0]?.id

  if (SYNC_MODE === 'charts-only') {
    await payload.update({
      collection: 'pages',
      id: page.id,
      depth: 0,
      data: {
        performanceNavPoints,
        performanceUsdShareClassData,
        performanceChfShareClassData,
      },
      context: {
        disableRevalidate: true,
      },
    })

    console.log(
      JSON.stringify(
        {
          success: true,
          mode: SYNC_MODE,
          pageId: page.id,
          updatedFields: {
            performanceNavPointsCount: performanceNavPoints.length,
            performanceUsdShareClassData: performanceUsdShareClassData ?? null,
            performanceChfShareClassData: performanceChfShareClassData ?? null,
          },
        },
        null,
        2,
      ),
    )
    return
  }

  await payload.update({
    collection: 'pages',
    id: page.id,
    depth: 0,
    data: {
      performanceHeroTitle,
      performanceAnnualTitle,
      performanceUsdLabel,
      performanceChfLabel,
      performanceExportSvgTooltip,
      performanceExportCsvTooltip,
      performanceNavPoints,
      performanceUsdShareClassData,
      performanceChfShareClassData,
      performanceChartYearBadge: performanceContent.chart.yearBadge,
      performanceCardsNavUpdatesTitle: performanceContent.cards.navUpdatesTitle,
      performanceCardsNavPerShareLabel: performanceContent.cards.navPerShareLabel,
      performanceCardsPerformanceMetricsTitle: performanceContent.cards.performanceMetricsTitle,
      performanceCardsAsOfPrefix: performanceContent.cards.asOfPrefix,
      performanceCardsPerformanceYtdLabel: performanceContent.cards.performanceYtdLabel,
      performanceCardsRiskMetricsTitle: performanceContent.cards.riskMetricsTitle,
      performanceCardsSharpeRatioLabel: performanceContent.cards.sharpeRatioLabel,
      performanceCardsVolatilityLabel: performanceContent.cards.volatilityLabel,
      performanceCardsSortinoRatioLabel: performanceContent.cards.sortinoRatioLabel,
      performanceCardsDownsideRiskLabel: performanceContent.cards.downsideRiskLabel,
      performanceCardsFundDetailsTitle: performanceContent.cards.fundDetailsTitle,
      performanceFootnoteSingleAsterisk: performanceContent.footnotes.singleAsterisk,
      performanceFootnoteDoubleAsterisk: performanceContent.footnotes.doubleAsterisk,
      performanceRelatedLinksHeading: performanceContent.relatedLinks.heading,
      performanceFullHistoryLabel: performanceContent.relatedLinks.fullHistory.label,
      performanceFullHistoryHref: performanceContent.relatedLinks.fullHistory.href,
      performanceFactsheetUsdLabel: performanceContent.relatedLinks.factsheetUsdLabel,
      performanceFactsheetUsdAsset,
      performanceFactsheetChfLabel: performanceContent.relatedLinks.factsheetChfLabel,
      performanceFactsheetChfAsset,
      performanceFundCommentaryLabel: performanceContent.relatedLinks.fundCommentaryLabel,
      performanceFundCommentaryAsset,
    },
    context: {
      disableRevalidate: true,
    },
  })

  console.log(
    JSON.stringify(
      {
        success: true,
        pageId: page.id,
        updatedFields: {
          performanceHeroTitle,
          performanceAnnualTitle,
          performanceUsdLabel,
          performanceChfLabel,
          performanceExportSvgTooltip,
          performanceExportCsvTooltip,
          performanceNavPointsCount: performanceNavPoints.length,
          performanceUsdShareClassData: performanceUsdShareClassData ?? null,
          performanceChfShareClassData: performanceChfShareClassData ?? null,
          performanceChartYearBadge: performanceContent.chart.yearBadge,
          performanceRelatedLinksHeading: performanceContent.relatedLinks.heading,
          performanceFactsheetUsdAsset: performanceFactsheetUsdAsset ?? null,
          performanceFactsheetChfAsset: performanceFactsheetChfAsset ?? null,
          performanceFundCommentaryAsset: performanceFundCommentaryAsset ?? null,
        },
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
