// @ts-nocheck
import dotenv from 'dotenv'
import path from 'node:path'
import portfolioStrategyContent from '@/constants/portfolio-strategy-content.json'
import { createWixClient } from '@/endpoints/wix-import/source-client'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

type AllocationTuple = [string, string, string, string?]
type ChartCollection =
  | 'portfolio-megatrend-allocations'
  | 'portfolio-geographic-allocations'
  | 'portfolio-sector-allocations'
  | 'portfolio-top-holdings'

type WixChartSource = {
  collectionId: string
  targetCollection: ChartCollection
}

type NormalizedChartRow = {
  name: string
  weight: number
  color: string
  manualSort: string
  sourceIndex: number
}

const DEFAULT_COLOR = '#0F3BBF'
const SOURCE_MODE = String(process.env.WIX_PORTFOLIO_CHART_SOURCE || 'wix')
  .trim()
  .toLowerCase()
const WIX_CHART_COLLECTIONS: WixChartSource[] = [
  {
    collectionId: 'MegatrendsAllocations',
    targetCollection: 'portfolio-megatrend-allocations',
  },
  {
    collectionId: 'GeographicAllocations',
    targetCollection: 'portfolio-geographic-allocations',
  },
  {
    collectionId: 'SectorAllocations',
    targetCollection: 'portfolio-sector-allocations',
  },
  {
    collectionId: 'TopHoldings',
    targetCollection: 'portfolio-top-holdings',
  },
]

function parseWeight(value: string): number {
  const normalized = value.replace('%', '').trim()
  const num = Number(normalized)
  if (!Number.isFinite(num)) return 0
  return Math.round(num * 100) / 100
}

function parseWeightFromUnknown(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.round(value * 100) / 100
  }
  if (typeof value === 'string') {
    return parseWeight(value)
  }
  return 0
}

function normalizeChartColor(value: unknown): string {
  if (typeof value !== 'string') return DEFAULT_COLOR
  const trimmed = value.trim()
  if (!trimmed) return DEFAULT_COLOR
  if (trimmed.startsWith('#')) return trimmed
  if (/^[0-9a-fA-F]{6}$/u.test(trimmed)) return `#${trimmed}`
  return DEFAULT_COLOR
}

function normalizeChartName(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value
    .replace(/\s+/gu, ' ')
    .trim()
}

function normalizeLabel(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

const sectorIconByLabel: Record<string, string> = {
  'consumer discretionary': 'shopping-bag',
  'info technology': 'cpu',
  industrials: 'factory',
  healthcare: 'heartbeat',
  'consumer staples': 'shopping-cart-simple',
  utilities: 'lightning',
  'comm services': 'broadcast',
  financials: 'bank',
}

function inferIcon(collection: ChartCollection, name: string): string | undefined {
  if (collection !== 'portfolio-sector-allocations') return undefined
  return sectorIconByLabel[normalizeLabel(name)]
}

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

function pickFirstDefined(record: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    const value = record[key]
    if (value !== undefined && value !== null) return value
  }
  return null
}

function extractManualSort(record: Record<string, unknown>): string {
  for (const [key, value] of Object.entries(record)) {
    if (!key.startsWith('_manualSort_')) continue
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

function buildTupleRowsFromJson(): Record<ChartCollection, AllocationTuple[]> {
  const allocations = portfolioStrategyContent.allocations as {
    megatrends: AllocationTuple[]
    geographic: AllocationTuple[]
    sectors: AllocationTuple[]
  }
  const topHoldings = portfolioStrategyContent.topHoldings as AllocationTuple[]

  return {
    'portfolio-megatrend-allocations': allocations.megatrends,
    'portfolio-geographic-allocations': allocations.geographic,
    'portfolio-sector-allocations': allocations.sectors,
    'portfolio-top-holdings': topHoldings,
  }
}

function normalizeWixChartItems(items: Array<{ data?: Record<string, unknown> }>): NormalizedChartRow[] {
  const normalized = items
    .map((item, index) => {
      const data = toRecord(item.data)
      const rawName = pickFirstDefined(data, ['title_fld', 'title', 'name', 'label'])
      const rawWeight = pickFirstDefined(data, ['number', 'weight', 'value', 'percentage', 'pct'])
      const rawColor = pickFirstDefined(data, ['color', 'colour'])

      const name = normalizeChartName(rawName)
      const weight = parseWeightFromUnknown(rawWeight)
      if (!name || !Number.isFinite(weight)) return null

      return {
        name,
        weight,
        color: normalizeChartColor(rawColor),
        manualSort: extractManualSort(data),
        sourceIndex: index,
      }
    })
    .filter((row): row is NormalizedChartRow => Boolean(row))

  normalized.sort((a, b) => {
    if (a.manualSort && b.manualSort && a.manualSort !== b.manualSort) {
      // Wix manual-sort tokens are monotonic strings; keep source-intended priority.
      return b.manualSort.localeCompare(a.manualSort)
    }
    if (a.manualSort && !b.manualSort) return -1
    if (!a.manualSort && b.manualSort) return 1
    return a.sourceIndex - b.sourceIndex
  })

  return normalized
}

async function loadWixRowsByTargetCollection(): Promise<Record<ChartCollection, AllocationTuple[]>> {
  const wixClient = createWixClient()
  const out = {} as Record<ChartCollection, AllocationTuple[]>

  for (const mapping of WIX_CHART_COLLECTIONS) {
    const items = await wixClient.getAllDataCollectionItems(mapping.collectionId, { limit: 1000 })
    const normalized = normalizeWixChartItems(items)
    if (normalized.length === 0) {
      throw new Error(`No chart rows resolved from Wix collection "${mapping.collectionId}".`)
    }

    out[mapping.targetCollection] = normalized.map((row) => {
      const inferredIcon = inferIcon(mapping.targetCollection, row.name)
      return [row.name, String(row.weight), row.color, inferredIcon] as AllocationTuple
    })
  }

  return out
}

async function upsertChartRows(args: {
  payload: Awaited<ReturnType<(typeof import('payload'))['getPayload']>>
  collection: ChartCollection
  rows: AllocationTuple[]
}) {
  let created = 0
  let updated = 0
  let unchanged = 0

  for (const [index, row] of args.rows.entries()) {
    const [name, weight, color, icon] = row
    const inferredIcon = inferIcon(args.collection, name)
    const nextData = {
      name: name.trim(),
      weight: parseWeight(weight),
      color: color.trim(),
      icon:
        typeof icon === 'string' && icon.trim()
          ? icon.trim()
          : typeof inferredIcon === 'string' && inferredIcon.trim()
            ? inferredIcon.trim()
            : undefined,
      sortOrder: index + 1,
    }

    const existingResult = await args.payload.find({
      collection: args.collection,
      where: {
        name: {
          equals: nextData.name,
        },
      },
      limit: 1,
      pagination: false,
      depth: 0,
    })

    const existing = existingResult.docs?.[0] as
      | { id: number; weight?: unknown; color?: unknown; icon?: unknown; sortOrder?: unknown }
      | undefined

    if (!existing) {
      await args.payload.create({
        collection: args.collection,
        depth: 0,
        data: nextData,
      })
      created++
      continue
    }

    const existingWeight = typeof existing.weight === 'number' ? existing.weight : null
    const existingColor = typeof existing.color === 'string' ? existing.color.trim() : ''
    const existingIcon = typeof existing.icon === 'string' ? existing.icon.trim() : ''
    const existingSort = typeof existing.sortOrder === 'number' ? existing.sortOrder : null
    const isSame =
      existingWeight !== null &&
      Math.abs(existingWeight - nextData.weight) < 0.000001 &&
      existingColor === nextData.color &&
      existingIcon === (nextData.icon ?? '') &&
      existingSort === nextData.sortOrder

    if (isSame) {
      unchanged++
      continue
    }

    await args.payload.update({
      collection: args.collection,
      id: existing.id,
      depth: 0,
      data: nextData,
    })
    updated++
  }

  return { created, updated, unchanged }
}

async function main() {
  const [{ default: config }, { getPayload }] = await Promise.all([
    import('@payload-config'),
    import('payload'),
  ])
  const payload = await getPayload({ config })

  const rowsByCollection =
    SOURCE_MODE === 'wix' ? await loadWixRowsByTargetCollection() : buildTupleRowsFromJson()

  const [megatrendsSummary, geographicSummary, sectorsSummary, topHoldingsSummary] = await Promise.all([
    upsertChartRows({
      payload,
      collection: 'portfolio-megatrend-allocations',
      rows: rowsByCollection['portfolio-megatrend-allocations'],
    }),
    upsertChartRows({
      payload,
      collection: 'portfolio-geographic-allocations',
      rows: rowsByCollection['portfolio-geographic-allocations'],
    }),
    upsertChartRows({
      payload,
      collection: 'portfolio-sector-allocations',
      rows: rowsByCollection['portfolio-sector-allocations'],
    }),
    upsertChartRows({
      payload,
      collection: 'portfolio-top-holdings',
      rows: rowsByCollection['portfolio-top-holdings'],
    }),
  ])

  console.log(
    JSON.stringify(
      {
        sourceMode: SOURCE_MODE,
        megatrends: megatrendsSummary,
        geographic: geographicSummary,
        sectors: sectorsSummary,
        topHoldings: topHoldingsSummary,
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
