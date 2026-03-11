import type { Metadata } from 'next'
import { getCMSPageBySlug } from '@/app/(frontend)/_components/getCMSPageBySlug'
import { PageHero } from '@/app/(frontend)/_components/PageHero'
import fallbacks from '@/constants/fallbacks.json'
import { generateMeta, generateStaticFallbackMeta } from '@/utilities/generateMeta'
import { notFound } from 'next/navigation'
import { createElement } from 'react'
import type { DefaultNodeTypes, DefaultTypedEditorState, SerializedLinkNode } from '@payloadcms/richtext-lexical'
import { LinkJSXConverter, RichText as ConvertRichText, type JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'

type LegalHeadingTag = 'h2' | 'h3' | 'h4'

type LegalHeading = {
  id: string
  text: string
  tag: LegalHeadingTag
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]+/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function extractNodeText(node: unknown): string {
  if (!node || typeof node !== 'object') return ''
  const record = node as { text?: unknown; children?: unknown[] }
  const ownText = typeof record.text === 'string' ? record.text : ''
  const childText = Array.isArray(record.children) ? record.children.map((item) => extractNodeText(item)).join('') : ''
  return `${ownText}${childText}`
}

function buildHeadingList(richText: unknown): LegalHeading[] {
  const root = (
    richText as {
      root?: {
        children?: unknown[]
      }
    }
  )?.root
  const rootChildren = Array.isArray(root?.children) ? root.children : []
  const rawHeadings: Array<{ text: string; tag: LegalHeadingTag }> = []

  const walk = (node: unknown) => {
    if (!node || typeof node !== 'object') return
    const record = node as { type?: unknown; tag?: unknown; children?: unknown[] }
    if (record.type === 'heading' && (record.tag === 'h2' || record.tag === 'h3' || record.tag === 'h4')) {
      const text = extractNodeText(node).trim()
      if (text) rawHeadings.push({ text, tag: record.tag })
    }
    if (Array.isArray(record.children)) {
      for (const child of record.children) walk(child)
    }
  }

  for (const node of rootChildren) walk(node)

  const seen = new Map<string, number>()
  return rawHeadings.map(({ text, tag }) => {
    const base = slugify(text) || 'section'
    const count = (seen.get(base) ?? 0) + 1
    seen.set(base, count)
    return {
      text,
      tag,
      id: count === 1 ? base : `${base}-${count}`,
    }
  })
}

function mergeLegacyLayoutRichText(layout: unknown): DefaultTypedEditorState | null {
  const blocks = Array.isArray(layout) ? layout : []
  const richTexts = blocks
    .flatMap((block) => {
      if ((block as { blockType?: string }).blockType !== 'content') return []
      const columns = (block as { columns?: unknown[] }).columns
      return Array.isArray(columns) ? columns : []
    })
    .map((column) => (column as { richText?: unknown }).richText)
    .filter((value): value is DefaultTypedEditorState => Boolean(value && typeof value === 'object'))

  if (richTexts.length === 0) return null

  const first = richTexts[0] as {
    root?: {
      children?: unknown[]
      direction?: unknown
      format?: unknown
      indent?: unknown
      type?: unknown
      version?: unknown
    }
  }

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
      version: typeof first.root?.version === 'number' ? first.root.version : 1,
      format: typeof first.root?.format === 'string' ? first.root.format : '',
      indent: typeof first.root?.indent === 'number' ? first.root.indent : 0,
      direction: first.root?.direction ?? null,
      children: mergedChildren,
    },
  } as DefaultTypedEditorState
}

function internalDocToHref({ linkNode }: { linkNode: SerializedLinkNode }): string {
  const fieldsDoc = linkNode.fields.doc
  if (!fieldsDoc) return '#'
  const { relationTo, value } = fieldsDoc
  if (!value || typeof value !== 'object') return '#'
  const slug = (value as { slug?: unknown }).slug
  if (typeof slug !== 'string' || !slug.trim()) return '#'
  return relationTo === 'posts' ? `/posts/${slug}` : `/${slug}`
}

function buildLegalConverters(headings: LegalHeading[]): JSXConvertersFunction<DefaultNodeTypes> {
  return ({ defaultConverters }) => {
    let headingIndex = 0

    return {
      ...defaultConverters,
      ...LinkJSXConverter({ internalDocToHref }),
      heading: ({ node, nodesToJSX }) => {
        const nodeTag = typeof node.tag === 'string' ? node.tag : 'h2'
        const children = nodesToJSX({ nodes: node.children })
        if (nodeTag !== 'h2' && nodeTag !== 'h3' && nodeTag !== 'h4') {
          return createElement(nodeTag, undefined, children)
        }

        const fallback = `${slugify(extractNodeText(node)) || 'section'}-${headingIndex + 1}`
        const id = headings[headingIndex]?.id ?? fallback
        headingIndex += 1
        return createElement(nodeTag, { id, className: 'scroll-mt-28' }, children)
      },
    }
  }
}

export default async function LegalPage() {
  const cmsPage = await getCMSPageBySlug('legal-information')
  if (!cmsPage) notFound()

  const page = cmsPage as {
    title?: unknown
    legalInformationContent?: unknown
    layout?: unknown
  }
  const legalRichText =
    (page.legalInformationContent && typeof page.legalInformationContent === 'object'
      ? (page.legalInformationContent as DefaultTypedEditorState)
      : null) ?? mergeLegacyLayoutRichText(page.layout)
  const headings = buildHeadingList(legalRichText)
  const converters = buildLegalConverters(headings)

  return (
    <main className="bg-white text-[#0b1035]">
      <PageHero
        title={(typeof page.title === 'string' && page.title) || fallbacks.pageTitles.legalInformation}
        palette={{ color1: '#2b3dea', color2: 'oklch(0.45 0.12 78)', color3: 'oklch(0.45 0.10 58)' }}
      />

      <div className="container py-16 md:py-20 max-w-4xl">
        {headings.length > 0 ? (
          <nav
            aria-label="Legal content table of contents"
            className="mb-8 border border-[#d9def0] bg-[#f7f9ff] px-5 py-4 rounded-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#5f6477] mb-3">On this page</p>
            <ul className="space-y-2 text-sm">
              {headings.map((heading) => (
                <li key={heading.id} className={heading.tag === 'h3' ? 'ml-4' : heading.tag === 'h4' ? 'ml-8' : ''}>
                  <a href={`#${heading.id}`} className="text-[#2b3dea] hover:underline">
                    {heading.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        {legalRichText ? (
          <ConvertRichText
            data={legalRichText}
            converters={converters}
            className="payload-richtext mx-auto max-w-[48rem] prose md:prose-md text-[#2b3045]"
          />
        ) : null}
      </div>
    </main>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const cmsPage = await getCMSPageBySlug('legal-information')
  if (cmsPage) return generateMeta({ doc: cmsPage })

  return generateStaticFallbackMeta('/legal-information', fallbacks.metadata.legalInformation)
}
