// @ts-nocheck
import dotenv from 'dotenv'
import path from 'node:path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const PAGE_ID = Number(process.env.LEGAL_INFORMATION_PAGE_ID || '9')
const FORCE = String(process.env.LEGAL_INFORMATION_FORCE_BACKFILL || 'false').trim().toLowerCase() === 'true'

function mergeLegacyLayoutRichText(layout: unknown): Record<string, unknown> | null {
  const blocks = Array.isArray(layout) ? layout : []
  const richTexts = blocks
    .flatMap((block) => {
      if ((block as { blockType?: string }).blockType !== 'content') return []
      const columns = (block as { columns?: unknown[] }).columns
      return Array.isArray(columns) ? columns : []
    })
    .map((column) => (column as { richText?: unknown }).richText)
    .filter((value): value is Record<string, unknown> => Boolean(value && typeof value === 'object'))

  if (richTexts.length === 0) return null

  const firstRoot = (richTexts[0] as { root?: Record<string, unknown> }).root ?? {}
  const mergedChildren: unknown[] = []
  richTexts.forEach((richText, index) => {
    const root = (richText as { root?: { children?: unknown[] } }).root
    const children = Array.isArray(root?.children) ? root.children : []
    mergedChildren.push(...children)
    if (index < richTexts.length - 1) {
      mergedChildren.push({
        type: 'paragraph',
        version: 1,
        indent: 0,
        format: '',
        direction: null,
        textFormat: 0,
        textStyle: '',
        children: [],
      })
    }
  })

  return {
    root: {
      type: 'root',
      version: typeof firstRoot.version === 'number' ? firstRoot.version : 1,
      format: typeof firstRoot.format === 'string' ? firstRoot.format : '',
      indent: typeof firstRoot.indent === 'number' ? firstRoot.indent : 0,
      direction: firstRoot.direction ?? null,
      children: mergedChildren,
    },
  }
}

async function main() {
  const [{ default: config }, { getPayload }] = await Promise.all([import('@payload-config'), import('payload')])
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'pages',
    where: { id: { equals: PAGE_ID } },
    limit: 1,
    pagination: false,
    depth: 0,
  })

  const page = result.docs?.[0] as
    | {
        id: number
        slug?: unknown
        layout?: unknown
        legalInformationContent?: unknown
      }
    | undefined

  if (!page) {
    throw new Error(`Page ${PAGE_ID} not found.`)
  }

  if (page.slug !== 'legal-information') {
    throw new Error(`Page ${PAGE_ID} slug is "${String(page.slug)}" (expected "legal-information").`)
  }

  const alreadySet = Boolean(page.legalInformationContent && typeof page.legalInformationContent === 'object')
  if (alreadySet && !FORCE) {
    console.log(
      JSON.stringify(
        {
          pageId: PAGE_ID,
          slug: page.slug,
          skipped: true,
          reason: 'legalInformationContent already set (use LEGAL_INFORMATION_FORCE_BACKFILL=true to overwrite).',
        },
        null,
        2,
      ),
    )
    return
  }

  const merged = mergeLegacyLayoutRichText(page.layout)
  if (!merged) {
    console.log(
      JSON.stringify(
        {
          pageId: PAGE_ID,
          slug: page.slug,
          skipped: true,
          reason: 'No legacy content blocks with richText found.',
        },
        null,
        2,
      ),
    )
    return
  }

  await payload.update({
    collection: 'pages',
    id: page.id,
    depth: 0,
    data: {
      legalInformationContent: merged,
    },
    context: {
      disableRevalidate: true,
    },
  })

  console.log(
    JSON.stringify(
      {
        pageId: PAGE_ID,
        slug: page.slug,
        updated: true,
        force: FORCE,
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
