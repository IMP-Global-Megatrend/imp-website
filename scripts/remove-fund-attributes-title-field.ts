import dotenv from 'dotenv'
import path from 'node:path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function main() {
  const [{ default: config }, { getPayload }] = await Promise.all([
    import('@payload-config'),
    import('payload'),
  ])

  const payload = await getPayload({ config })

  let page = 1
  let updated = 0

  while (true) {
    const result = await payload.find({
      collection: 'fund-attributes',
      depth: 0,
      limit: 100,
      page,
      sort: 'createdAt',
    })

    if (!result.docs.length) break

    for (const doc of result.docs) {
      await payload.update({
        collection: 'fund-attributes',
        id: doc.id,
        depth: 0,
        data: {
          sourceItemId: doc.sourceItemId,
        },
        context: { disableRevalidate: true },
      })
      updated += 1
    }

    if (page >= result.totalPages) break
    page += 1
  }

  console.log(JSON.stringify({ success: true, updated }, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
