// @ts-nocheck
import dotenv from 'dotenv'
import path from 'node:path'
import megatrendsContent from '@/constants/megatrends-content.json'

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
    where: { slug: { equals: 'megatrends' } },
    limit: 1,
    pagination: false,
    depth: 0,
  })
  const page = pageResult.docs?.[0]
  if (!page) throw new Error('megatrends page not found.')

  const existingResult = await payload.find({
    collection: 'megatrend-detail-blocks',
    where: { page: { equals: page.id } },
    limit: 100,
    pagination: false,
    depth: 0,
    sort: 'sortOrder',
  })
  const existingBySortOrder = new Map<number, any>()
  for (const doc of existingResult.docs || []) {
    const sortOrder = typeof doc.sortOrder === 'number' ? doc.sortOrder : -1
    if (sortOrder >= 0 && !existingBySortOrder.has(sortOrder)) existingBySortOrder.set(sortOrder, doc)
  }

  const blocks = megatrendsContent.megatrends || []
  const blockIds: Array<number | string> = []
  const results = []

  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index]
    const sortOrder = index + 1
    const mediaId = await resolveMediaIdBySrc(payload, block.icon || '')
    const data = {
      page: page.id,
      anchor: block.anchor || `megatrend-${sortOrder}`,
      title: block.title || `Megatrend ${sortOrder}`,
      subtitle: block.subtitle || '',
      description: (block.description || []).map((text, itemIndex) => ({
        text: typeof text === 'string' ? text : '',
        sortOrder: itemIndex + 1,
      })),
      conclusion: block.conclusion || '',
      image: mediaId || undefined,
      imageSrc: block.icon || '',
      sortOrder,
    }

    const existing = existingBySortOrder.get(sortOrder)
    if (existing?.id) {
      const updated = await payload.update({
        collection: 'megatrend-detail-blocks',
        id: existing.id,
        depth: 0,
        data,
        context: { disableRevalidate: true },
      })
      blockIds.push(updated.id)
      results.push({
        action: 'updated',
        id: updated.id,
        sortOrder,
        title: data.title,
        mediaLinked: Boolean(mediaId),
        mediaId,
      })
    } else {
      const created = await payload.create({
        collection: 'megatrend-detail-blocks',
        depth: 0,
        data,
        context: { disableRevalidate: true },
      })
      blockIds.push(created.id)
      results.push({
        action: 'created',
        id: created.id,
        sortOrder,
        title: data.title,
        mediaLinked: Boolean(mediaId),
        mediaId,
      })
    }
  }

  await payload.update({
    collection: 'pages',
    id: page.id,
    depth: 0,
    data: {
      megatrendDetailBlocks: blockIds,
    },
    context: { disableRevalidate: true },
  })

  console.log(
    JSON.stringify(
      {
        success: true,
        pageId: page.id,
        totalBlocks: blockIds.length,
        blockIds,
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
