// @ts-nocheck
import dotenv from 'dotenv'
import path from 'node:path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

type AnyRecord = Record<string, unknown>

function getTextField(
  fields: Array<{ key?: unknown; value?: unknown }> | undefined,
  key: string,
): string {
  if (!Array.isArray(fields)) return ''
  const field = fields.find((entry) => entry?.key === key)
  return typeof field?.value === 'string' ? field.value.trim() : ''
}

function normalizeSourceForLookup(source: string): string {
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

function getFileNameCandidate(source: string): string {
  if (!source) return ''
  const cleaned = source.split('?')[0]?.split('#')[0] || ''
  const fromApi = cleaned.startsWith('/api/media/file/') ? cleaned.replace('/api/media/file/', '') : cleaned
  const parts = fromApi.split('/').filter(Boolean)
  return parts[parts.length - 1] || ''
}

function extractMegatrendImageSource(doc: AnyRecord): string {
  const data = (doc.data && typeof doc.data === 'object' ? doc.data : {}) as AnyRecord
  const textFields = Array.isArray(doc.textFields) ? doc.textFields : []

  const candidates = [
    typeof data.image_fld === 'string' ? data.image_fld.trim() : '',
    getTextField(textFields, 'image_fld'),
    typeof data.image === 'string' ? data.image.trim() : '',
    getTextField(textFields, 'image'),
  ]

  return candidates.find((value) => typeof value === 'string' && value.length > 0) || ''
}

async function resolveMediaIdBySource(
  payload: Awaited<ReturnType<(typeof import('payload'))['getPayload']>>,
  source: string,
): Promise<number | null> {
  if (!source) return null

  const normalized = normalizeSourceForLookup(source)
  const uniqueSources = Array.from(new Set([source, normalized])).filter(Boolean)

  for (const candidate of uniqueSources) {
    const bySource = await payload.find({
      collection: 'media',
      limit: 1,
      pagination: false,
      depth: 0,
      where: {
        sourceUrl: {
          equals: candidate,
        },
      },
    })
    const mediaDoc = bySource.docs?.[0]
    if (mediaDoc?.id) return Number(mediaDoc.id)
  }

  if (source.startsWith('/api/media/file/')) {
    const byUrl = await payload.find({
      collection: 'media',
      limit: 1,
      pagination: false,
      depth: 0,
      where: {
        url: {
          equals: source,
        },
      },
    })
    const mediaDoc = byUrl.docs?.[0]
    if (mediaDoc?.id) return Number(mediaDoc.id)
  }

  const filename = getFileNameCandidate(normalized)
  if (filename) {
    const byFilename = await payload.find({
      collection: 'media',
      limit: 1,
      pagination: false,
      depth: 0,
      where: {
        filename: {
          equals: filename,
        },
      },
    })
    const mediaDoc = byFilename.docs?.[0]
    if (mediaDoc?.id) return Number(mediaDoc.id)
  }

  return null
}

function upsertImageMediaField(
  mediaFields: Array<{ key?: unknown; value?: unknown; id?: unknown }> | undefined,
  mediaId: number,
): Array<{ key: string; value: number; id?: unknown }> {
  const next = Array.isArray(mediaFields)
    ? mediaFields
        .filter((entry) => typeof entry?.key === 'string')
        .map((entry) => ({
          key: String(entry.key),
          value: typeof entry.value === 'number' ? entry.value : Number(entry.value),
          id: entry.id,
        }))
        .filter((entry) => Number.isFinite(entry.value))
    : []

  const idx = next.findIndex((entry) => entry.key === 'image_fld')
  if (idx >= 0) {
    next[idx] = { ...next[idx], key: 'image_fld', value: mediaId }
  } else {
    next.push({ key: 'image_fld', value: mediaId })
  }

  return next
}

async function main() {
  const [{ default: config }, { getPayload }] = await Promise.all([
    import('@payload-config'),
    import('payload'),
  ])

  const payload = await getPayload({ config })
  const megatrends = await payload.find({
    collection: 'megatrend-dataset',
    limit: 200,
    pagination: false,
    depth: 0,
  })

  let updated = 0
  let alreadySet = 0
  const missingSource: string[] = []
  const missingMedia: Array<{ title: string; source: string }> = []

  for (const doc of megatrends.docs as AnyRecord[]) {
    const title = (() => {
      const data = (doc.data && typeof doc.data === 'object' ? doc.data : {}) as AnyRecord
      const textFields = Array.isArray(doc.textFields) ? doc.textFields : []
      return (
        (typeof data.title_fld === 'string' && data.title_fld.trim()) ||
        getTextField(textFields, 'title_fld') ||
        `#${String(doc.id)}`
      )
    })()

    const imageSource = extractMegatrendImageSource(doc)
    if (!imageSource) {
      missingSource.push(title)
      continue
    }

    const mediaId = await resolveMediaIdBySource(payload, imageSource)
    if (!mediaId) {
      missingMedia.push({ title, source: imageSource })
      continue
    }

    const currentMediaFields = Array.isArray(doc.mediaFields) ? doc.mediaFields : []
    const currentImageField = currentMediaFields.find(
      (entry: { key?: unknown; value?: unknown }) => entry?.key === 'image_fld',
    ) as { value?: unknown } | undefined
    const currentValue = typeof currentImageField?.value === 'number' ? currentImageField.value : null
    if (currentValue === mediaId) {
      alreadySet++
      continue
    }

    const nextMediaFields = upsertImageMediaField(currentMediaFields, mediaId)

    await payload.update({
      collection: 'megatrend-dataset',
      id: String(doc.id),
      depth: 0,
      data: {
        mediaFields: nextMediaFields,
      },
    })

    updated++
  }

  const summary = {
    totalDocs: megatrends.docs.length,
    updated,
    alreadySet,
    missingSourceCount: missingSource.length,
    missingMediaCount: missingMedia.length,
    missingSourceTitles: missingSource,
    missingMedia,
  }

  payload.logger.info({ summary }, 'Megatrend mediaFields backfill completed')
  console.log(JSON.stringify(summary, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
