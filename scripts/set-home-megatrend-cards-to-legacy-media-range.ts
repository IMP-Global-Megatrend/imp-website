// @ts-nocheck
import dotenv from 'dotenv'
import path from 'node:path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const LEGACY_MEDIA_IDS = [33, 34, 35, 36, 37, 38]

async function main() {
  const [{ default: config }, { getPayload }] = await Promise.all([
    import('@payload-config'),
    import('payload'),
  ])
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'home-megatrend-cards',
    limit: 200,
    pagination: false,
    depth: 0,
    sort: 'sortOrder',
  })

  const docs = (result.docs || []).slice(0, LEGACY_MEDIA_IDS.length)
  const updates = []
  for (let index = 0; index < docs.length; index += 1) {
    const doc = docs[index]
    const mediaId = LEGACY_MEDIA_IDS[index]
    const updated = await payload.update({
      collection: 'home-megatrend-cards',
      id: doc.id,
      depth: 0,
      data: {
        image: mediaId,
      },
      context: { disableRevalidate: true },
    })
    updates.push({
      id: updated.id,
      sortOrder: updated.sortOrder,
      title: updated.title,
      mediaId,
    })
  }

  console.log(
    JSON.stringify(
      {
        success: true,
        totalUpdated: updates.length,
        updates,
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
