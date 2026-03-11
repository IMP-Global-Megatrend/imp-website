import { getPayload } from 'payload'
import config from '@payload-config'
import { wixCollectionDefinitions } from '@/collections/SourceCollections'
import { normalizeWixDataFields, sanitizeWixRawData } from '@/endpoints/wix-import/normalize-data'

async function backfill(): Promise<void> {
  const payload = await getPayload({ config })

  for (const def of wixCollectionDefinitions) {
    const collection = def.slug as Parameters<typeof payload.find>[0]['collection']
    let page = 1
    const limit = 100
    let processed = 0

    while (true) {
      const found = await payload.find({
        collection,
        page,
        limit,
        depth: 0,
      })

      for (const doc of found.docs as Array<{ id: number | string; data?: Record<string, unknown> }>) {
        const raw = doc.data
        if (!raw || typeof raw !== 'object') continue

        const sanitized = sanitizeWixRawData(raw)
        const normalized = normalizeWixDataFields(sanitized)
        await payload.update({
          collection,
          id: doc.id,
          data: {
            ...normalized,
            data: sanitized,
          },
          depth: 0,
          context: { disableRevalidate: true },
        } as unknown as Parameters<typeof payload.update>[0])
        processed++
      }

      if (!found.hasNextPage) break
      page += 1
    }

    payload.logger.info(`Backfilled ${processed} docs in ${def.slug}`)
  }
}

try {
  await backfill()
  console.log('Backfill complete')
} catch (error) {
  console.error('Backfill failed:', error)
  process.exit(1)
}
