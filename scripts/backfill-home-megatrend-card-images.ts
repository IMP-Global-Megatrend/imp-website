// @ts-nocheck
import dotenv from 'dotenv'
import path from 'node:path'
import megatrendsContent from '@/constants/megatrends-content.json'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function resolveMediaIdByImagePath(payload: any, imagePath: string): Promise<number | string | null> {
  const filename = path.basename(imagePath || '')
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

  const iconByTitle = new Map<string, string>()
  for (const item of megatrendsContent.megatrends || []) {
    if (typeof item?.title === 'string' && typeof item?.icon === 'string') {
      iconByTitle.set(item.title.trim(), item.icon.trim())
    }
  }

  const cardsResult = await payload.find({
    collection: 'home-megatrend-cards',
    limit: 200,
    pagination: false,
    depth: 0,
    sort: 'sortOrder',
  })

  const results = []
  for (const card of cardsResult.docs || []) {
    const title = typeof card.title === 'string' ? card.title.trim() : ''
    const iconPath = iconByTitle.get(title) || ''
    const mediaId = iconPath ? await resolveMediaIdByImagePath(payload, iconPath) : null

    const data: Record<string, unknown> = {}
    if (iconPath && (!card.imageSrc || typeof card.imageSrc !== 'string' || !card.imageSrc.trim())) {
      data.imageSrc = iconPath
    }
    if (mediaId && !card.image) {
      data.image = mediaId
    }

    if (Object.keys(data).length === 0) {
      results.push({
        id: card.id,
        title,
        action: 'skipped',
        reason: 'Already linked or no matching icon path/media found.',
      })
      continue
    }

    const updated = await payload.update({
      collection: 'home-megatrend-cards',
      id: card.id,
      depth: 0,
      data,
      context: { disableRevalidate: true },
    })

    results.push({
      id: updated.id,
      title,
      action: 'updated',
      imageSrcSet: Boolean(data.imageSrc),
      mediaLinked: Boolean(data.image),
      mediaId: data.image ?? null,
    })
  }

  console.log(
    JSON.stringify(
      {
        success: true,
        total: cardsResult.docs?.length || 0,
        updated: results.filter((row) => row.action === 'updated').length,
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
