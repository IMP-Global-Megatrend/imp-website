// @ts-nocheck
import dotenv from 'dotenv'
import path from 'node:path'
import portfolioStrategyContent from '@/constants/portfolio-strategy-content.json'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

type AllocationTuple = [string, string, string]

function parseWeight(value: string): number {
  const normalized = value.replace('%', '').trim()
  const num = Number(normalized)
  if (!Number.isFinite(num)) return 0
  return Math.round(num * 100) / 100
}

async function upsertChartRows(args: {
  payload: Awaited<ReturnType<(typeof import('payload'))['getPayload']>>
  collection:
    | 'portfolio-megatrend-allocations'
    | 'portfolio-geographic-allocations'
    | 'portfolio-sector-allocations'
    | 'portfolio-top-holdings'
  rows: AllocationTuple[]
}) {
  let created = 0
  let updated = 0
  let unchanged = 0

  for (const [index, row] of args.rows.entries()) {
    const [name, weight, color] = row
    const nextData = {
      name: name.trim(),
      weight: parseWeight(weight),
      color: color.trim(),
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
      | { id: number; weight?: unknown; color?: unknown; sortOrder?: unknown }
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
    const existingSort = typeof existing.sortOrder === 'number' ? existing.sortOrder : null
    const isSame =
      existingWeight !== null &&
      Math.abs(existingWeight - nextData.weight) < 0.000001 &&
      existingColor === nextData.color &&
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

  const allocations = portfolioStrategyContent.allocations as {
    megatrends: AllocationTuple[]
    geographic: AllocationTuple[]
    sectors: AllocationTuple[]
  }
  const topHoldings = portfolioStrategyContent.topHoldings as AllocationTuple[]

  const [megatrendsSummary, geographicSummary, sectorsSummary, topHoldingsSummary] = await Promise.all([
    upsertChartRows({
      payload,
      collection: 'portfolio-megatrend-allocations',
      rows: allocations.megatrends,
    }),
    upsertChartRows({
      payload,
      collection: 'portfolio-geographic-allocations',
      rows: allocations.geographic,
    }),
    upsertChartRows({
      payload,
      collection: 'portfolio-sector-allocations',
      rows: allocations.sectors,
    }),
    upsertChartRows({
      payload,
      collection: 'portfolio-top-holdings',
      rows: topHoldings,
    }),
  ])

  console.log(
    JSON.stringify(
      {
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
