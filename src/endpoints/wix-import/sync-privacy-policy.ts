import { getPayload } from 'payload'
import config from '@payload-config'

import type { WixDataItem, WixRichContent } from './types'
import { createWixClient } from './source-client'
import { plainTextToLexical, wixRichContentToLexical } from './converters/rich-text'

type WixRecord = Record<string, unknown>

function getTextValue(data: WixRecord, key: string): string | null {
  const value = data[key]
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function getRichContent(data: WixRecord): WixRichContent | null {
  const value = data.richcontent ?? data.richContent
  if (!value || typeof value !== 'object') return null
  const nodes = (value as { nodes?: unknown }).nodes
  if (!Array.isArray(nodes)) return null
  return value as WixRichContent
}

function toMetaDescription(data: WixRecord): string {
  const fallback = 'Data Protection Statement of MRB Fund Partners AG.'
  const rich = getRichContent(data)
  if (!rich?.nodes?.length) return fallback

  for (const node of rich.nodes) {
    if (node?.type !== 'PARAGRAPH' || !Array.isArray(node.nodes)) continue
    const text = node.nodes
      .filter((child) => child?.type === 'TEXT' && typeof child.textData?.text === 'string')
      .map((child) => child.textData?.text as string)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
    if (text) {
      return text.length > 160 ? `${text.slice(0, 157)}...` : text
    }
  }

  return fallback
}

async function run() {
  const payload = await getPayload({ config })
  const wix = createWixClient()

  const response = await wix.queryDataCollection('PrivacyPolicy', { limit: 10, offset: 0 })
  const items = (response.items ?? []) as WixDataItem[]

  if (items.length === 0) {
    throw new Error('No items returned from Wix collection "PrivacyPolicy".')
  }

  const privacyItem = items[0]
  const data = (privacyItem.data ?? {}) as WixRecord
  const title = getTextValue(data, 'title_fld') ?? 'Privacy Policy'
  const richContent = getRichContent(data)
  const richText = richContent ? wixRichContentToLexical(richContent) : plainTextToLexical('')

  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'privacy-policy' } },
    depth: 0,
    limit: 1,
  })

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

  if (existing.docs[0]) {
    await payload.update({
      collection: 'pages',
      id: existing.docs[0].id,
      data: pageData,
      depth: 0,
      context: { disableRevalidate: true },
    })
    console.log(
      JSON.stringify(
        {
          success: true,
          action: 'updated',
          slug: 'privacy-policy',
          sourceItemId: privacyItem.id,
        },
        null,
        2,
      ),
    )
    return
  }

  await payload.create({
    collection: 'pages',
    data: pageData,
    depth: 0,
    context: { disableRevalidate: true },
  })
  console.log(
    JSON.stringify(
      {
        success: true,
        action: 'created',
        slug: 'privacy-policy',
        sourceItemId: privacyItem.id,
      },
      null,
      2,
    ),
  )
}

try {
  await run()
} catch (error) {
  console.error('Failed to sync privacy-policy from Wix:', error)
  process.exit(1)
}
