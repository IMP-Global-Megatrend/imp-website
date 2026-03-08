// @ts-nocheck
import dotenv from 'dotenv'
import path from 'node:path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

function normalizeMediaLookupSource(source: string): string {
  if (source.startsWith('wix:image://v1/')) {
    const fileId = source.replace('wix:image://v1/', '').split('/')[0]
    return fileId ? `https://static.wixstatic.com/media/${fileId}` : source
  }

  if (source.startsWith('wix:document://v1/ugd/')) {
    const fileId = source.replace('wix:document://v1/ugd/', '').split('/')[0]
    return fileId ? `https://www.impgmtfund.com/_files/ugd/${fileId}` : source
  }

  return source
}

function extractFilename(source: string): string {
  const withoutQuery = source.split('?')[0]?.split('#')[0]?.trim() || ''
  if (!withoutQuery) return ''
  if (withoutQuery.startsWith('/api/media/file/')) {
    return withoutQuery.replace('/api/media/file/', '').trim()
  }
  return path.basename(withoutQuery)
}

async function findMediaId(payload: any, source: string): Promise<number | string | null> {
  if (!source || typeof source !== 'string') return null

  const normalizedSource = normalizeMediaLookupSource(source)
  const candidates = Array.from(new Set([normalizedSource, source])).filter(Boolean)

  for (const candidate of candidates) {
    const bySource = await payload.find({
      collection: 'media',
      where: { sourceUrl: { equals: candidate } },
      limit: 1,
      pagination: false,
      depth: 0,
    })
    if (bySource.docs?.[0]?.id) return bySource.docs[0].id

    const byUrl = await payload.find({
      collection: 'media',
      where: { url: { equals: candidate } },
      limit: 1,
      pagination: false,
      depth: 0,
    })
    if (byUrl.docs?.[0]?.id) return byUrl.docs[0].id
  }

  const filename = extractFilename(normalizedSource)
  if (filename) {
    const byFilename = await payload.find({
      collection: 'media',
      where: { filename: { equals: filename } },
      limit: 1,
      pagination: false,
      depth: 0,
    })
    if (byFilename.docs?.[0]?.id) return byFilename.docs[0].id
  }

  return null
}

async function main() {
  const [{ default: config }, { getPayload }] = await Promise.all([
    import('@payload-config'),
    import('payload'),
  ])
  const payload = await getPayload({ config })

  const cardsResult = await payload.find({
    collection: 'home-megatrend-cards',
    limit: 200,
    pagination: false,
    depth: 0,
    sort: 'sortOrder',
  })

  let linked = 0
  let skippedAlreadyLinked = 0
  const unresolved: Array<{ id: number | string; title: string; imageSrc: string }> = []

  for (const card of cardsResult.docs || []) {
    if (card.image) {
      skippedAlreadyLinked += 1
      continue
    }

    const imageSrc = typeof card.imageSrc === 'string' ? card.imageSrc.trim() : ''
    if (!imageSrc) {
      unresolved.push({ id: card.id, title: String(card.title || ''), imageSrc: '' })
      continue
    }

    const mediaId = await findMediaId(payload, imageSrc)
    if (!mediaId) {
      unresolved.push({ id: card.id, title: String(card.title || ''), imageSrc })
      continue
    }

    await payload.update({
      collection: 'home-megatrend-cards',
      id: card.id,
      depth: 0,
      data: { image: mediaId },
      context: { disableRevalidate: true },
    })
    linked += 1
  }

  console.log(
    JSON.stringify(
      {
        success: true,
        total: cardsResult.docs?.length || 0,
        linked,
        skippedAlreadyLinked,
        unresolvedCount: unresolved.length,
        unresolved,
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
