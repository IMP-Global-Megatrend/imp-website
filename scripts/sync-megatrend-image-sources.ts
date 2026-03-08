// @ts-nocheck
import config from '@payload-config'
import { getPayload } from 'payload'

type CMSDoc = Record<string, unknown>

function getTextField(
  fields: Array<{ key?: unknown; value?: unknown }> | undefined,
  key: string,
): string {
  if (!Array.isArray(fields)) return ''
  const field = fields.find((entry) => entry?.key === key)
  return typeof field?.value === 'string' ? field.value.trim() : ''
}

function setTextField(
  fields: Array<{ key?: unknown; value?: unknown }>,
  key: string,
  value: string,
): Array<{ key?: unknown; value?: unknown }> {
  const next = [...fields]
  const idx = next.findIndex((entry) => entry?.key === key)
  if (idx >= 0) {
    next[idx] = { ...(next[idx] as object), key, value }
  } else {
    next.push({ key, value })
  }
  return next
}

function normalizeTitle(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

async function main() {
  const payload = await getPayload({ config })

  const [detailResult, datasetResult] = await Promise.all([
    payload.find({
      collection: 'wix-megatrends-detail',
      limit: 200,
      pagination: false,
      depth: 0,
    }),
    payload.find({
      collection: 'wix-megatrend-dataset',
      limit: 200,
      pagination: false,
      depth: 0,
    }),
  ])

  const detailByTitle = new Map<string, string>()
  for (const doc of detailResult.docs as CMSDoc[]) {
    const data = (doc.data && typeof doc.data === 'object' ? doc.data : {}) as Record<string, unknown>
    const textFields = Array.isArray(doc.textFields) ? doc.textFields : []
    const title =
      (typeof data.title_fld === 'string' && data.title_fld.trim()) || getTextField(textFields, 'title_fld')
    const image =
      (typeof data.image_fld === 'string' && data.image_fld.trim()) || getTextField(textFields, 'image_fld')
    if (!title || !image) continue
    detailByTitle.set(normalizeTitle(title), image)
  }

  let updated = 0
  const skipped: string[] = []
  for (const doc of datasetResult.docs as CMSDoc[]) {
    const data = (doc.data && typeof doc.data === 'object' ? doc.data : {}) as Record<string, unknown>
    const textFields = Array.isArray(doc.textFields) ? doc.textFields : []
    const title =
      (typeof data.title_fld === 'string' && data.title_fld.trim()) || getTextField(textFields, 'title_fld')
    if (!title) continue

    const normalizedTitle = normalizeTitle(title)
    const targetImageSource = detailByTitle.get(normalizedTitle)
    if (!targetImageSource) {
      skipped.push(title)
      continue
    }

    const currentImage =
      (typeof data.image_fld === 'string' && data.image_fld.trim()) || getTextField(textFields, 'image_fld')
    if (currentImage === targetImageSource) continue

    const nextData = {
      ...data,
      image_fld: targetImageSource,
    }

    const nextTextFields = setTextField(
      textFields as Array<{ key?: unknown; value?: unknown }>,
      'image_fld',
      targetImageSource,
    )

    await payload.update({
      collection: 'wix-megatrend-dataset',
      id: String(doc.id),
      depth: 0,
      data: {
        data: nextData,
        textFields: nextTextFields,
      },
    })
    updated++
  }

  const summary = {
    updated,
    skippedTitlesWithoutDetailImage: skipped,
  }
  payload.logger.info({ summary }, 'Megatrend dataset image source sync completed')
  console.log(JSON.stringify(summary, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
