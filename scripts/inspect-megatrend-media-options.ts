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

  const target = await payload.findByID({
    collection: 'media',
    id: 33,
    depth: 0,
  })

  const byMegatrendName = await payload.find({
    collection: 'media',
    where: {
      filename: {
        like: 'megatrend_',
      },
    },
    sort: 'id',
    limit: 200,
    pagination: false,
    depth: 0,
  })

  console.log(
    JSON.stringify(
      {
        target33: target
          ? {
              id: target.id,
              filename: target.filename,
              url: target.url,
              sourceUrl: target.sourceUrl,
            }
          : null,
        megatrendLike: (byMegatrendName.docs || []).map((doc) => ({
          id: doc.id,
          filename: doc.filename,
          url: doc.url,
          sourceUrl: doc.sourceUrl,
        })),
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
