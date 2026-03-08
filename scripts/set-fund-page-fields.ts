// @ts-nocheck
import dotenv from 'dotenv'
import path from 'node:path'
import fundContent from '@/constants/fund-content.json'
import fallbacks from '@/constants/fallbacks.json'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

function getTextFieldValue(
  textFields: Array<{ key?: unknown; value?: unknown }> | null | undefined,
  key: string,
): string | null {
  if (!Array.isArray(textFields)) return null
  const match = textFields.find((entry) => entry?.key === key)
  if (typeof match?.value === 'string' && match.value.trim()) return match.value.trim()
  return null
}

function getDataString(data: Record<string, unknown>, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = data[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return null
}

async function main() {
  const [{ default: config }, { getPayload }] = await Promise.all([
    import('@payload-config'),
    import('payload'),
  ])
  const payload = await getPayload({ config })

  const [pageResult, fundDetailsResult, fundAttributesResult] = await Promise.all([
    payload.find({
      collection: 'pages',
      where: { slug: { equals: 'fund' } },
      limit: 1,
      pagination: false,
      depth: 0,
    }),
    payload.find({
      collection: 'fund-details',
      limit: 1,
      pagination: false,
      depth: 0,
    }),
    payload.find({
      collection: 'fund-attributes',
      limit: 500,
      pagination: false,
      depth: 0,
    }),
  ])

  const page = pageResult.docs?.[0]
  if (!page) throw new Error('fund page not found.')

  const sourceDoc = fundDetailsResult.docs?.[0] as
    | {
        data?: Record<string, unknown> | unknown
        textFields?: Array<{ key?: unknown; value?: unknown }> | null
      }
    | undefined
  const sourceData = (sourceDoc?.data && typeof sourceDoc.data === 'object'
    ? sourceDoc.data
    : {}) as Record<string, unknown>
  const sourceTextFields = sourceDoc?.textFields

  const fundIntroPrimaryQuote =
    getDataString(sourceData, 'introQuotePrimary') || getTextFieldValue(sourceTextFields, 'introQuotePrimary') || ''
  const fundIntroSecondaryQuote =
    getDataString(sourceData, 'introQuoteSecondary') || getTextFieldValue(sourceTextFields, 'introQuoteSecondary') || ''
  const relatedFallback = fallbacks.fund.relatedLinks
  const relatedItems = fundContent.relatedLinks.items || []
  const fundAttributes = (fundAttributesResult.docs || []).map((doc) => doc.id).filter(Boolean)

  await payload.update({
    collection: 'pages',
    id: page.id,
    depth: 0,
    data: {
      fundIntroPrimaryQuote,
      fundIntroSecondaryQuote,
      fundInvestmentObjectiveHeading: fundContent.investmentObjective.heading,
      fundInvestmentObjectiveBody: fundContent.investmentObjective.body,
      fundRelatedLinksHeading: fundContent.relatedLinks.heading || relatedFallback.heading,
      fundRelatedPrimaryLabel: relatedItems[0]?.label || relatedFallback.items[0]?.label || '',
      fundRelatedPrimaryHref: relatedItems[0]?.href || relatedFallback.items[0]?.href || '',
      fundRelatedSecondaryLabel: relatedItems[1]?.label || relatedFallback.items[1]?.label || '',
      fundRelatedSecondaryHref: relatedItems[1]?.href || relatedFallback.items[1]?.href || '',
      fundRelatedTertiaryLabel: relatedItems[2]?.label || relatedFallback.items[2]?.label || '',
      fundRelatedTertiaryHref: relatedItems[2]?.href || relatedFallback.items[2]?.href || '',
      fundAttributes,
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
        fundAttributesCount: fundAttributes.length,
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
