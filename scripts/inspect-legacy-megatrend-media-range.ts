// @ts-nocheck
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

  const rows = []
  for (let id = 33; id <= 45; id += 1) {
    try {
      const doc = await payload.findByID({
        collection: 'media',
        id,
        depth: 0,
      })
      rows.push({
        id: doc.id,
        filename: doc.filename,
        sourceUrl: doc.sourceUrl || '',
      })
    } catch {
      rows.push({ id, missing: true })
    }
  }

  console.log(JSON.stringify({ success: true, rows }, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
