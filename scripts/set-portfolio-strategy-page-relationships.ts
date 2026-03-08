// @ts-nocheck
import dotenv from 'dotenv'
import path from 'node:path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function getIds(payload: any, collection: string, limit = 500): Promise<Array<number | string>> {
  const result = await payload.find({
    collection,
    limit,
    pagination: false,
    depth: 0,
    sort: 'sortOrder',
  })
  return (result.docs || []).map((doc: any) => doc.id).filter(Boolean)
}

async function main() {
  const [{ default: config }, { getPayload }] = await Promise.all([
    import('@payload-config'),
    import('payload'),
  ])
  const payload = await getPayload({ config })

  const pageResult = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'portfolio-strategy' } },
    limit: 1,
    pagination: false,
    depth: 0,
  })
  const page = pageResult.docs?.[0]
  if (!page) throw new Error('portfolio-strategy page not found.')

  const [
    portfolioInvestmentProcessItems,
    portfolioMegatrendAllocations,
    portfolioGeographicAllocations,
    portfolioSectorAllocations,
    portfolioTopHoldings,
  ] = await Promise.all([
    getIds(payload, 'portfolio-investment-process-items', 300),
    getIds(payload, 'portfolio-megatrend-allocations', 300),
    getIds(payload, 'portfolio-geographic-allocations', 300),
    getIds(payload, 'portfolio-sector-allocations', 300),
    getIds(payload, 'portfolio-top-holdings', 500),
  ])

  await payload.update({
    collection: 'pages',
    id: page.id,
    depth: 0,
    data: {
      portfolioInvestmentProcessItems,
      portfolioMegatrendAllocations,
      portfolioGeographicAllocations,
      portfolioSectorAllocations,
      portfolioTopHoldings,
    },
    context: {
      disableRevalidate: true,
    },
  })

  console.log(
    JSON.stringify(
      {
        success: true,
        pageId: page.id,
        counts: {
          portfolioInvestmentProcessItems: portfolioInvestmentProcessItems.length,
          portfolioMegatrendAllocations: portfolioMegatrendAllocations.length,
          portfolioGeographicAllocations: portfolioGeographicAllocations.length,
          portfolioSectorAllocations: portfolioSectorAllocations.length,
          portfolioTopHoldings: portfolioTopHoldings.length,
        },
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
