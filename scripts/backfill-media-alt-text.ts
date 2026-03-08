import config from '@payload-config'
import { getPayload } from 'payload'

type MediaDoc = {
  id: number | string
  alt?: string | null
  filename?: string | null
}

function filenameToAlt(filename: string): string {
  const withoutExt = filename.replace(/\.[a-zA-Z0-9]+$/, '')
  const normalized = withoutExt
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!normalized) return 'Imported image'
  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

async function main() {
  const payload = await getPayload({ config })

  let page = 1
  const limit = 100
  let updated = 0
  let scanned = 0

  while (true) {
    const result = await payload.find({
      collection: 'media',
      page,
      limit,
      depth: 0,
      pagination: true,
    })

    for (const rawDoc of result.docs as MediaDoc[]) {
      scanned++
      const currentAlt = typeof rawDoc.alt === 'string' ? rawDoc.alt.trim() : ''
      if (currentAlt) continue

      const filename = typeof rawDoc.filename === 'string' ? rawDoc.filename : ''
      const nextAlt = filenameToAlt(filename)

      await payload.update({
        collection: 'media',
        id: rawDoc.id,
        depth: 0,
        data: {
          alt: nextAlt,
        },
      })

      updated++
      payload.logger.info(`Updated media ${String(rawDoc.id)} alt="${nextAlt}"`)
    }

    if (!result.hasNextPage) break
    page = result.nextPage ?? page + 1
  }

  const summary = { scanned, updated }
  payload.logger.info({ summary }, 'Media alt text backfill completed')
  console.log(JSON.stringify(summary, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
