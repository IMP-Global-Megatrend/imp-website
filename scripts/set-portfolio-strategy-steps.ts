// @ts-nocheck
import dotenv from 'dotenv'
import path from 'node:path'
import portfolioStrategyContent from '@/constants/portfolio-strategy-content.json'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function resolveMediaIdBySrc(payload: any, src: string): Promise<number | string | null> {
  if (!src || typeof src !== 'string') return null
  const normalized = src.split('?')[0]?.split('#')[0]?.trim() || ''
  if (!normalized) return null

  const filename = path.basename(normalized)
  if (!filename) return null

  const mediaResult = await payload.find({
    collection: 'media',
    where: {
      filename: { equals: filename },
    },
    limit: 1,
    pagination: false,
    depth: 0,
  })

  return mediaResult.docs?.[0]?.id ?? null
}

async function main() {
  const [{ default: config }, { getPayload }] = await Promise.all([
    import('@payload-config'),
    import('payload'),
  ])
  const payload = await getPayload({ config })

  const pageResult = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'portfolio-strategy' } },
    limit: 1,
    pagination: false,
    depth: 0,
  })
  const page = pageResult.docs?.[0]
  if (!page) throw new Error('portfolio-strategy page not found.')

  const existingResult = await payload.find({
    collection: 'portfolio-strategy-steps',
    where: { page: { equals: page.id } },
    limit: 200,
    pagination: false,
    depth: 0,
    sort: 'sortOrder',
  })

  const existingBySortOrder = new Map<number, any>()
  for (const doc of existingResult.docs || []) {
    const sortOrder = typeof doc.sortOrder === 'number' ? doc.sortOrder : -1
    if (sortOrder >= 0 && !existingBySortOrder.has(sortOrder)) {
      existingBySortOrder.set(sortOrder, doc)
    }
  }

  const steps = portfolioStrategyContent.strategySteps || []
  const results = []
  const stepIds: Array<number | string> = []

  for (let index = 0; index < steps.length; index += 1) {
    const step = steps[index]
    const sortOrder = index + 1
    const mediaId = await resolveMediaIdBySrc(payload, step.src || '')
    const data = {
      page: page.id,
      title: step.title || `Step ${sortOrder}`,
      image: mediaId || undefined,
      imageSrc: step.src || '',
      items: (step.items || []).map((item, itemIndex) => ({
        heading: item.heading || `Block ${itemIndex + 1}`,
        body: item.body || '',
        sortOrder: itemIndex + 1,
      })),
      sortOrder,
    }

    const existing = existingBySortOrder.get(sortOrder)
    if (existing?.id) {
      const updated = await payload.update({
        collection: 'portfolio-strategy-steps',
        id: existing.id,
        depth: 0,
        data,
        context: { disableRevalidate: true },
      })
      results.push({
        action: 'updated',
        id: updated.id,
        sortOrder,
        title: data.title,
        itemCount: data.items.length,
        mediaLinked: Boolean(mediaId),
        mediaId,
      })
      stepIds.push(updated.id)
    } else {
      const created = await payload.create({
        collection: 'portfolio-strategy-steps',
        depth: 0,
        data,
        context: { disableRevalidate: true },
      })
      results.push({
        action: 'created',
        id: created.id,
        sortOrder,
        title: data.title,
        itemCount: data.items.length,
        mediaLinked: Boolean(mediaId),
        mediaId,
      })
      stepIds.push(created.id)
    }
  }

  await payload.update({
    collection: 'pages',
    id: page.id,
    depth: 0,
    data: {
      portfolioStrategySteps: stepIds,
    },
    context: { disableRevalidate: true },
  })

  console.log(
    JSON.stringify(
      {
        success: true,
        pageId: page.id,
        totalSteps: results.length,
        linkedStepIds: stepIds,
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
