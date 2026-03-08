// @ts-nocheck
import dotenv from 'dotenv'
import path from 'node:path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getTextFieldValue(record: Record<string, unknown>, key: string): string {
  const direct = record[key]
  if (typeof direct === 'string' && direct.trim()) return direct.trim()

  const textFields = Array.isArray(record.textFields) ? record.textFields : []
  const textMatch = textFields.find((entry) => entry?.key === key && typeof entry?.value === 'string')
  if (typeof textMatch?.value === 'string' && textMatch.value.trim()) return textMatch.value.trim()

  return ''
}

function getSortValue(record: Record<string, unknown>): string {
  const raw = getTextFieldValue(record, '_manualSort')
  if (raw) return raw
  return ''
}

async function main() {
  const [{ default: config }, { getPayload }] = await Promise.all([
    import('@payload-config'),
    import('payload'),
  ])
  const payload = await getPayload({ config })

  const pageResult = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
    pagination: false,
    depth: 0,
  })
  const page = pageResult.docs?.[0]
  if (!page) throw new Error('home page not found.')

  const sourceResult = await payload.find({
    collection: 'megatrend-dataset',
    limit: 200,
    pagination: false,
    depth: 0,
  })

  const sourceRows = (sourceResult.docs || [])
    .map((doc) => {
      const data = typeof doc?.data === 'object' && doc?.data ? doc.data : {}
      const title = getTextFieldValue(data, 'title_fld')
      const body = stripHtml(getTextFieldValue(data, 'description_fld'))
      if (!title || !body) return null

      const firstCode = getTextFieldValue(data, 'firstStockCode')
      const firstName = getTextFieldValue(data, 'firstStockName')
      const secondCode = getTextFieldValue(data, 'secondStockCode')
      const secondName = getTextFieldValue(data, 'secondStockName')
      const tickers = []
      if (firstCode && firstName) tickers.push({ ticker: firstCode, company: firstName, sortOrder: 1 })
      if (secondCode && secondName) tickers.push({ ticker: secondCode, company: secondName, sortOrder: 2 })

      const imageSrc =
        getTextFieldValue(data, 'megatrendImage') ||
        getTextFieldValue(data, 'img_fld') ||
        getTextFieldValue(data, 'image')

      return {
        title,
        body,
        tickers,
        imageSrc,
        manualSort: getSortValue(data),
      }
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (a.manualSort !== b.manualSort) return b.manualSort.localeCompare(a.manualSort)
      return b.title.localeCompare(a.title)
    })

  const existingResult = await payload.find({
    collection: 'home-megatrend-cards',
    where: { page: { equals: page.id } },
    limit: 200,
    pagination: false,
    depth: 0,
    sort: 'sortOrder',
  })

  const existingBySortOrder = new Map()
  for (const doc of existingResult.docs || []) {
    if (typeof doc.sortOrder === 'number' && !existingBySortOrder.has(doc.sortOrder)) {
      existingBySortOrder.set(doc.sortOrder, doc)
    }
  }

  const cardIds = []
  const results = []

  for (let index = 0; index < sourceRows.length; index += 1) {
    const source = sourceRows[index]
    const sortOrder = index + 1
    const data = {
      page: page.id,
      title: source.title,
      body: source.body,
      tickers: source.tickers,
      imageSrc: source.imageSrc || '',
      sortOrder,
    }

    const existing = existingBySortOrder.get(sortOrder)
    if (existing?.id) {
      const updated = await payload.update({
        collection: 'home-megatrend-cards',
        id: existing.id,
        depth: 0,
        data,
        context: { disableRevalidate: true },
      })
      cardIds.push(updated.id)
      results.push({ action: 'updated', id: updated.id, sortOrder, title: source.title })
    } else {
      const created = await payload.create({
        collection: 'home-megatrend-cards',
        depth: 0,
        data,
        context: { disableRevalidate: true },
      })
      cardIds.push(created.id)
      results.push({ action: 'created', id: created.id, sortOrder, title: source.title })
    }
  }

  await payload.update({
    collection: 'pages',
    id: page.id,
    depth: 0,
    data: {
      homeMegatrendCards: cardIds,
    },
    context: { disableRevalidate: true },
  })

  console.log(
    JSON.stringify(
      {
        success: true,
        pageId: page.id,
        totalCards: cardIds.length,
        cardIds,
        results,
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
