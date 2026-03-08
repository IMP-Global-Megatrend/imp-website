// @ts-nocheck
import dotenv from 'dotenv'
import path from 'node:path'
import portfolioStrategyContent from '@/constants/portfolio-strategy-content.json'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function main() {
  const [{ default: config }, { getPayload }] = await Promise.all([
    import('@payload-config'),
    import('payload'),
  ])
  const payload = await getPayload({ config })

  const items = Array.isArray(portfolioStrategyContent.investmentProcess)
    ? portfolioStrategyContent.investmentProcess
    : []

  let created = 0
  let updated = 0
  let unchanged = 0

  for (const [index, item] of items.entries()) {
    const description = typeof item === 'string' ? item.trim() : ''
    if (!description) continue

    const sortOrder = index + 1
    const title = `Step ${sortOrder}`

    const existingResult = await payload.find({
      collection: 'portfolio-investment-process-items',
      where: {
        sortOrder: {
          equals: sortOrder,
        },
      },
      limit: 1,
      pagination: false,
      depth: 0,
    })

    const existing = existingResult.docs?.[0] as
      | { id: number; title?: unknown; description?: unknown }
      | undefined

    if (!existing) {
      await payload.create({
        collection: 'portfolio-investment-process-items',
        depth: 0,
        data: {
          title,
          description,
          sortOrder,
        },
      })
      created++
      continue
    }

    const existingTitle = typeof existing.title === 'string' ? existing.title.trim() : ''
    const existingDescription = typeof existing.description === 'string' ? existing.description.trim() : ''
    if (existingTitle === title && existingDescription === description) {
      unchanged++
      continue
    }

    await payload.update({
      collection: 'portfolio-investment-process-items',
      id: existing.id,
      depth: 0,
      data: {
        title,
        description,
        sortOrder,
      },
    })
    updated++
  }

  console.log(
    JSON.stringify(
      {
        totalSourceItems: items.length,
        created,
        updated,
        unchanged,
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
