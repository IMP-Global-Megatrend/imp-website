// @ts-nocheck
import dotenv from 'dotenv'
import path from 'node:path'
import { createWixClient } from '@/endpoints/wix-import/source-client'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

type PerformanceNavPoint = {
  dateISO: string
  nav: number
}

const SOURCE_MODE = String(process.env.WIX_PERFORMANCE_SOURCE || 'wix')
  .trim()
  .toLowerCase()

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
    id?: unknown
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

function stableDayKey(dateISO: string): string {
  const parsed = new Date(dateISO)
  if (Number.isNaN(parsed.getTime())) return dateISO
  return parsed.toISOString().slice(0, 10)
}

async function main() {
  const [{ default: config }, { getPayload }] = await Promise.all([
    import('@payload-config'),
    import('payload'),
  ])

  const payload = await getPayload({ config })

  const existingResult = await payload.find({
    collection: 'performance-nav-points',
    limit: 5000,
    pagination: false,
    depth: 0,
  })

  const existingMap = new Map<string, { id: number | string; nav: number }>()
  for (const doc of existingResult.docs as Array<Record<string, unknown>>) {
    const shareClass = doc.shareClass
    const asOf = parseCMSDateToISO(doc.asOf)
    const nav = doc.nav
    if ((shareClass !== 'usd' && shareClass !== 'chf') || !asOf || typeof nav !== 'number') continue
    existingMap.set(`${shareClass}:${stableDayKey(asOf)}`, { id: doc.id as number | string, nav })
  }

  const rows: Array<{
    shareClass: 'usd' | 'chf'
    point: PerformanceNavPoint
    sourceItemId: string
    sourceCollection: string
  }> = []

  if (SOURCE_MODE === 'wix') {
    const wix = createWixClient()
    const [usdItems, chfItems] = await Promise.all([
      wix.getAllDataCollectionItems('Import1', { limit: 5000 }),
      wix.getAllDataCollectionItems('ImportCHF', { limit: 5000 }),
    ])

    for (const item of usdItems as Array<Record<string, unknown>>) {
      const point = toPerformanceNavPoint({ data: item.data })
      if (!point) continue
      rows.push({
        shareClass: 'usd',
        point,
        sourceItemId: String(item.id ?? ''),
        sourceCollection: 'Import1',
      })
    }

    for (const item of chfItems as Array<Record<string, unknown>>) {
      const point = toPerformanceNavPoint({ data: item.data })
      if (!point) continue
      rows.push({
        shareClass: 'chf',
        point,
        sourceItemId: String(item.id ?? ''),
        sourceCollection: 'ImportCHF',
      })
    }
  } else {
    const [usdResult, chfResult] = await Promise.all([
      payload.find({
        collection: 'import-usd',
        limit: 5000,
        pagination: false,
        depth: 0,
      }),
      payload.find({
        collection: 'import-chf',
        limit: 5000,
        pagination: false,
        depth: 0,
      }),
    ])

    for (const doc of usdResult.docs as Array<Record<string, unknown>>) {
      const point = toPerformanceNavPoint(doc)
      if (!point) continue
      rows.push({
        shareClass: 'usd',
        point,
        sourceItemId: String(doc.sourceItemId ?? doc.id ?? ''),
        sourceCollection: 'import-usd',
      })
    }

    for (const doc of chfResult.docs as Array<Record<string, unknown>>) {
      const point = toPerformanceNavPoint(doc)
      if (!point) continue
      rows.push({
        shareClass: 'chf',
        point,
        sourceItemId: String(doc.sourceItemId ?? doc.id ?? ''),
        sourceCollection: 'import-chf',
      })
    }
  }

  // Keep the latest occurrence per share-class/day key.
  const deduped = new Map<string, (typeof rows)[number]>()
  for (const row of rows) {
    const key = `${row.shareClass}:${stableDayKey(row.point.dateISO)}`
    deduped.set(key, row)
  }

  let created = 0
  let updated = 0
  let unchanged = 0

  for (const [key, row] of deduped.entries()) {
    const existing = existingMap.get(key)
    if (!existing) {
      await payload.create({
        collection: 'performance-nav-points',
        depth: 0,
        data: {
          shareClass: row.shareClass,
          asOf: row.point.dateISO,
          nav: row.point.nav,
          sourceCollection: row.sourceCollection,
          sourceItemId: row.sourceItemId,
        },
      })
      created++
      continue
    }

    if (Math.abs(existing.nav - row.point.nav) < 0.000001) {
      unchanged++
      continue
    }

    await payload.update({
      collection: 'performance-nav-points',
      id: existing.id,
      depth: 0,
      data: {
        nav: row.point.nav,
        sourceCollection: row.sourceCollection,
        sourceItemId: row.sourceItemId,
      },
    })
    updated++
  }

  const summary = {
    sourceMode: SOURCE_MODE,
    usdSourceRows: rows.filter((r) => r.shareClass === 'usd').length,
    chfSourceRows: rows.filter((r) => r.shareClass === 'chf').length,
    dedupedRows: deduped.size,
    created,
    updated,
    unchanged,
  }

  console.log(JSON.stringify(summary, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
