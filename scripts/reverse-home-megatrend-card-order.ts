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

  const pageResult = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
    pagination: false,
    depth: 2,
  })
  const homePage = pageResult.docs?.[0]
  if (!homePage) throw new Error('home page not found.')

  const cardsResult = await payload.find({
    collection: 'home-megatrend-cards',
    where: { page: { equals: homePage.id } },
    limit: 200,
    pagination: false,
    depth: 0,
    sort: 'sortOrder',
  })
  const cards = cardsResult.docs || []
  if (cards.length === 0) {
    console.log(JSON.stringify({ success: true, message: 'No cards found.' }, null, 2))
    return
  }

  const reversed = [...cards].reverse()
  const updates = []

  for (let index = 0; index < reversed.length; index += 1) {
    const doc = reversed[index]
    const nextSortOrder = index + 1
    const updated = await payload.update({
      collection: 'home-megatrend-cards',
      id: doc.id,
      depth: 0,
      data: {
        sortOrder: nextSortOrder,
      },
      context: { disableRevalidate: true },
    })
    updates.push({
      id: updated.id,
      title: updated.title,
      sortOrder: updated.sortOrder,
    })
  }

  const relationshipOrder = updates.map((row) => row.id)
  await payload.update({
    collection: 'pages',
    id: homePage.id,
    depth: 0,
    data: {
      homeMegatrendCards: relationshipOrder,
    },
    context: { disableRevalidate: true },
  })

  console.log(
    JSON.stringify(
      {
        success: true,
        pageId: homePage.id,
        total: updates.length,
        relationshipOrder,
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
