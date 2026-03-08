// @ts-nocheck
import config from '@payload-config'
import { getPayload } from 'payload'
import { plainTextToLexical, wixRichContentToLexical } from '@/endpoints/wix-import/converters/rich-text'

type CMSRecord = Record<string, unknown>

function getTextValue(data: CMSRecord, key: string): string | null {
  const value = data[key]
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function getRichContent(data: CMSRecord): Record<string, unknown> | null {
  const value = data.richcontent ?? data.richContent
  const nodes = (value as { nodes?: unknown } | null)?.nodes
  return Array.isArray(nodes) ? (value as Record<string, unknown>) : null
}

function toMetaDescription(data: CMSRecord): string {
  const fallback = 'Data Protection Statement of MRB Fund Partners AG.'
  const rich = getRichContent(data) as { nodes?: Array<Record<string, unknown>> } | null
  if (!rich?.nodes?.length) return fallback

  for (const node of rich.nodes) {
    if (node?.type !== 'PARAGRAPH') continue
    const nodeChildren = Array.isArray(node.nodes) ? node.nodes : []
    const text = nodeChildren
      .map((child) => {
        const textData = (child as { textData?: { text?: unknown } }).textData
        return typeof textData?.text === 'string' ? textData.text : ''
      })
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
    if (text) return text.length > 160 ? `${text.slice(0, 157)}...` : text
  }

  return fallback
}

async function main() {
  const payload = await getPayload({ config })

  const sourceResult = await payload.find({
    collection: 'wix-privacy-policy',
    limit: 1,
    pagination: false,
    depth: 0,
  })
  const sourceDoc = sourceResult.docs?.[0] as { data?: CMSRecord } | undefined
  if (!sourceDoc?.data) {
    throw new Error('No source document found in wix-privacy-policy.')
  }

  const data = sourceDoc.data
  const title = getTextValue(data, 'title_fld') ?? 'Privacy Policy'
  const richContent = getRichContent(data)
  const richText = richContent ? wixRichContentToLexical(richContent as never) : plainTextToLexical('')

  const pageData = {
    title,
    slug: 'privacy-policy',
    _status: 'published' as const,
    hero: {
      type: 'lowImpact' as const,
      richText: plainTextToLexical(title),
    },
    layout: [
      {
        blockType: 'content' as const,
        columns: [
          {
            size: 'full' as const,
            richText,
          },
        ],
      },
    ],
    meta: {
      title,
      description: toMetaDescription(data),
    },
  }

  const pageResult = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'privacy-policy' } },
    depth: 0,
    limit: 1,
  })

  if (pageResult.docs[0]) {
    await payload.update({
      collection: 'pages',
      id: pageResult.docs[0].id,
      data: pageData,
      depth: 0,
      context: { disableRevalidate: true },
    })
    console.log(JSON.stringify({ success: true, action: 'updated', slug: 'privacy-policy' }, null, 2))
    return
  }

  await payload.create({
    collection: 'pages',
    data: pageData,
    depth: 0,
    context: { disableRevalidate: true },
  })
  console.log(JSON.stringify({ success: true, action: 'created', slug: 'privacy-policy' }, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
