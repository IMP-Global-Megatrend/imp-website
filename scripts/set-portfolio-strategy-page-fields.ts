// @ts-nocheck
import dotenv from 'dotenv'
import path from 'node:path'
import portfolioStrategyContent from '@/constants/portfolio-strategy-content.json'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

function richTextToParagraphs(richText: unknown): string[] {
  const root = (richText as { root?: { children?: Array<Record<string, unknown>> } } | null)?.root
  const children = Array.isArray(root?.children) ? root.children : []

  return children
    .map((node) => {
      const textChildren = Array.isArray(node?.children) ? (node.children as Array<Record<string, unknown>>) : []
      return textChildren
        .filter((child) => child?.type === 'text' && typeof child.text === 'string')
        .map((child) => child.text as string)
        .join('')
        .replace(/\s+/g, ' ')
        .trim()
    })
    .filter(Boolean)
}

function getFirstContentSectionText(layout: unknown): string | null {
  if (!Array.isArray(layout)) return null
  for (const block of layout) {
    const record = (block && typeof block === 'object' ? block : {}) as Record<string, unknown>
    if (record.blockType !== 'content') continue
    const columns = Array.isArray(record.columns) ? record.columns : []
    const parts: string[] = []
    for (const column of columns) {
      const columnRecord = (column && typeof column === 'object' ? column : {}) as Record<string, unknown>
      const paragraphs = richTextToParagraphs(columnRecord.richText)
      if (paragraphs.length > 0) parts.push(paragraphs.join('\n\n'))
    }
    if (parts.length > 0) return parts.join('\n\n')
  }
  return null
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

  const introFromLayout = getFirstContentSectionText(page.layout)
  const portfolioStrategyIntro = introFromLayout || portfolioStrategyContent.introFallback || ''

  await payload.update({
    collection: 'pages',
    id: page.id,
    depth: 0,
    data: {
      portfolioStrategyIntro,
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
        portfolioStrategyIntro,
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
