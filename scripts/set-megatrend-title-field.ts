// @ts-nocheck
import dotenv from 'dotenv'
import path from 'node:path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

function getTextField(
  fields: Array<{ key?: unknown; value?: unknown }> | undefined,
  key: string,
): string {
  if (!Array.isArray(fields)) return ''
  const field = fields.find((entry) => entry?.key === key)
  return typeof field?.value === 'string' ? field.value.trim() : ''
}

async function main() {
  const [{ default: config }, { getPayload }] = await Promise.all([
    import('@payload-config'),
    import('payload'),
  ])

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'megatrend-dataset',
    limit: 200,
    pagination: false,
    depth: 0,
  })

  let updated = 0
  let alreadySet = 0

  for (const doc of result.docs as Array<Record<string, unknown>>) {
    const data = (doc.data && typeof doc.data === 'object' ? doc.data : {}) as Record<string, unknown>
    const textFields = Array.isArray(doc.textFields) ? doc.textFields : []
    const nextTitle =
      (typeof data.title_fld === 'string' && data.title_fld.trim()) || getTextField(textFields, 'title_fld')

    if (!nextTitle) continue

    const currentTitle = typeof doc.title_fld === 'string' ? doc.title_fld.trim() : ''
    if (currentTitle === nextTitle) {
      alreadySet++
      continue
    }

    await payload.update({
      collection: 'megatrend-dataset',
      id: String(doc.id),
      depth: 0,
      data: {
        title_fld: nextTitle,
      },
    })

    updated++
  }

  console.log(
    JSON.stringify(
      {
        totalDocs: result.docs.length,
        updated,
        alreadySet,
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
