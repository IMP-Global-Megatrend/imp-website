import type {
  WixRichContent,
  WixRichContentNode,
  WixTextDecoration,
  WixNodeType,
} from '@/endpoints/wix-import/types'

/**
 * Converts Wix Rich Content (Ricos) format to Payload CMS Lexical editor format.
 *
 * Wix Ricos uses a flat node structure with typed data fields,
 * while Lexical uses a nested tree structure with explicit type/tag fields.
 */

// Lexical node types
type LexicalElementFormat = '' | 'left' | 'start' | 'center' | 'right' | 'end' | 'justify'

interface LexicalNode {
  type: string
  version: number
  [key: string]: unknown
}

export interface RichTextConversionOptions {
  resolveMediaId?: (url: string) => number | string | null | undefined
  onUnresolvedMedia?: (url: string) => void
}

export interface LexicalRoot {
  [key: string]: unknown
  root: {
    type: 'root'
    children: LexicalNode[]
    direction: 'ltr' | 'rtl' | null
    format: LexicalElementFormat
    indent: number
    version: number
  }
}

interface LexicalTextNode extends LexicalNode {
  type: 'text'
  text: string
  format: number
  detail: number
  mode: 'normal' | 'token' | 'segmented'
  style: string
  version: number
}

interface LexicalLinkNode extends LexicalNode {
  type: 'link' | 'autolink'
  children: LexicalNode[]
  direction: 'ltr' | 'rtl' | null
  format: LexicalElementFormat
  indent: number
  version: number
  fields: {
    linkType: 'custom'
    url: string
    newTab: boolean
  }
}

interface LexicalParagraphNode extends LexicalNode {
  type: 'paragraph'
  children: LexicalNode[]
  direction: 'ltr' | 'rtl' | null
  format: LexicalElementFormat
  indent: number
  textFormat: number
  version: number
}

interface LexicalHeadingNode extends LexicalNode {
  type: 'heading'
  tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  children: LexicalNode[]
  direction: 'ltr' | 'rtl' | null
  format: LexicalElementFormat
  indent: number
  version: number
}

interface LexicalListNode extends LexicalNode {
  type: 'list'
  tag: 'ul' | 'ol'
  listType: 'bullet' | 'number'
  start: number
  children: LexicalNode[]
  direction: 'ltr' | 'rtl' | null
  format: LexicalElementFormat
  indent: number
  version: number
}

interface LexicalListItemNode extends LexicalNode {
  type: 'listitem'
  value: number
  children: LexicalNode[]
  direction: 'ltr' | 'rtl' | null
  format: LexicalElementFormat
  indent: number
  version: number
}

interface LexicalQuoteNode extends LexicalNode {
  type: 'quote'
  children: LexicalNode[]
  direction: 'ltr' | 'rtl' | null
  format: LexicalElementFormat
  indent: number
  version: number
}

interface LexicalHorizontalRuleNode extends LexicalNode {
  type: 'horizontalrule'
  version: number
}

// Lexical text format bitmask values
const TEXT_FORMAT = {
  BOLD: 1,
  ITALIC: 2,
  STRIKETHROUGH: 4,
  UNDERLINE: 8,
  CODE: 16,
  SUBSCRIPT: 32,
  SUPERSCRIPT: 64,
} as const

function getTextAlignment(textAlignment?: string): LexicalElementFormat {
  switch (textAlignment) {
    case 'CENTER':
      return 'center'
    case 'RIGHT':
      return 'right'
    case 'JUSTIFY':
      return 'justify'
    case 'LEFT':
      return 'left'
    default:
      return ''
  }
}

function computeTextFormat(decorations?: WixTextDecoration[]): number {
  if (!decorations?.length) return 0

  let format = 0
  for (const dec of decorations) {
    switch (dec.type) {
      case 'BOLD':
        format |= TEXT_FORMAT.BOLD
        break
      case 'ITALIC':
        format |= TEXT_FORMAT.ITALIC
        break
      case 'UNDERLINE':
        format |= TEXT_FORMAT.UNDERLINE
        break
    }
  }
  return format
}

function buildTextStyle(decorations?: WixTextDecoration[]): string {
  if (!decorations?.length) return ''

  const styles: string[] = []
  for (const dec of decorations) {
    if (dec.type === 'COLOR' && dec.colorData?.foreground) {
      styles.push(`color: ${dec.colorData.foreground}`)
    }
    if (dec.type === 'FONT_SIZE' && dec.fontSizeData?.value) {
      const unit = dec.fontSizeData.unit === 'EM' ? 'em' : 'px'
      styles.push(`font-size: ${dec.fontSizeData.value}${unit}`)
    }
  }
  return styles.join('; ')
}

function findLinkDecoration(
  decorations?: WixTextDecoration[],
): WixTextDecoration | undefined {
  return decorations?.find((d) => d.type === 'LINK' || d.type === 'ANCHOR')
}

function convertTextNode(node: WixRichContentNode): LexicalNode {
  const { textData } = node
  if (!textData) {
    return createTextNode('')
  }

  const linkDec = findLinkDecoration(textData.decorations)
  const textNode = createTextNode(
    textData.text,
    computeTextFormat(textData.decorations),
    buildTextStyle(textData.decorations),
  )

  if (linkDec) {
    const url =
      linkDec.linkData?.link?.url || (linkDec.anchorData ? `#${linkDec.anchorData.anchor}` : '')
    const newTab = linkDec.linkData?.link?.target === '_blank'

    const linkNode: LexicalLinkNode = {
      type: 'link',
      children: [textNode],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 3,
      fields: {
        linkType: 'custom',
        url,
        newTab,
      },
    }
    return linkNode
  }

  return textNode
}

function createTextNode(text: string, format = 0, style = ''): LexicalTextNode {
  return {
    type: 'text',
    text,
    format,
    detail: 0,
    mode: 'normal',
    style,
    version: 1,
  }
}

function convertInlineChildren(nodes?: WixRichContentNode[]): LexicalNode[] {
  if (!nodes?.length) return [createTextNode('')]

  return nodes.map((child) => {
    if (child.type === 'TEXT') {
      return convertTextNode(child)
    }
    return createTextNode(child.textData?.text ?? '')
  })
}

function convertParagraph(node: WixRichContentNode): LexicalParagraphNode {
  const alignment = getTextAlignment(node.paragraphData?.textStyle?.textAlignment)
  return {
    type: 'paragraph',
    children: convertInlineChildren(node.nodes),
    direction: 'ltr',
    format: alignment,
    indent: node.paragraphData?.indentation ?? 0,
    textFormat: 0,
    version: 1,
  }
}

function convertHeading(node: WixRichContentNode): LexicalHeadingNode {
  const level = node.headingData?.level ?? 2
  const clampedLevel = Math.min(Math.max(level, 1), 6) as 1 | 2 | 3 | 4 | 5 | 6
  const alignment = getTextAlignment(node.headingData?.textStyle?.textAlignment)

  return {
    type: 'heading',
    tag: `h${clampedLevel}`,
    children: convertInlineChildren(node.nodes),
    direction: 'ltr',
    format: alignment,
    indent: node.headingData?.indentation ?? 0,
    version: 1,
  }
}

function convertListItems(nodes?: WixRichContentNode[]): LexicalListItemNode[] {
  if (!nodes?.length) return []

  return nodes
    .filter((n) => n.type === 'LIST_ITEM')
    .map((item, index) => {
      const innerParagraph = item.nodes?.find((n) => n.type === 'PARAGRAPH')
      const children = innerParagraph
        ? convertInlineChildren(innerParagraph.nodes)
        : convertInlineChildren(item.nodes)

      return {
        type: 'listitem' as const,
        value: index + 1,
        children,
        direction: 'ltr' as const,
        format: '',
        indent: item.listItemData?.indentation ?? 0,
        version: 1,
      }
    })
}

function convertBulletedList(node: WixRichContentNode): LexicalListNode {
  return {
    type: 'list',
    tag: 'ul',
    listType: 'bullet',
    start: 1,
    children: convertListItems(node.nodes),
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  }
}

function convertOrderedList(node: WixRichContentNode): LexicalListNode {
  return {
    type: 'list',
    tag: 'ol',
    listType: 'number',
    start: 1,
    children: convertListItems(node.nodes),
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  }
}

function convertBlockquote(node: WixRichContentNode): LexicalQuoteNode {
  const children: LexicalNode[] = []
  if (node.nodes?.length) {
    for (const child of node.nodes) {
      if (child.type === 'PARAGRAPH') {
        children.push(...convertInlineChildren(child.nodes))
      } else if (child.type === 'TEXT') {
        children.push(convertTextNode(child))
      } else {
        children.push(...convertInlineChildren(child.nodes))
      }
    }
  }

  return {
    type: 'quote',
    children: children.length ? children : [createTextNode('')],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  }
}

function convertDivider(): LexicalHorizontalRuleNode {
  return {
    type: 'horizontalrule',
    version: 1,
  }
}

function convertImage(node: WixRichContentNode, options?: RichTextConversionOptions): LexicalNode {
  const imageData = node.imageData
  const src = resolveWixImageUrl(imageData?.image?.src?.url || imageData?.image?.src?.id)
  const alt = imageData?.altText || imageData?.image?.altText || ''

  // Payload's Lexical upload node for inline images
  // Falls back to a paragraph with descriptive text if no URL
  if (!src) {
    return {
      type: 'paragraph',
      children: [createTextNode(`[Image: ${alt || 'missing source'}]`)],
      direction: 'ltr',
      format: '',
      indent: 0,
      textFormat: 0,
      version: 1,
    } satisfies LexicalParagraphNode
  }

  const mediaId = options?.resolveMediaId?.(src)
  if (!mediaId) {
    options?.onUnresolvedMedia?.(src)
    return {
      type: 'paragraph',
      children: [createTextNode(`[Image: ${alt || 'unresolved media'}] ${src}`)],
      direction: 'ltr',
      format: '',
      indent: 0,
      textFormat: 0,
      version: 1,
    } satisfies LexicalParagraphNode
  }

  // Store as a Payload block node (mediaBlock) that the post content supports
  return {
    type: 'block',
    fields: {
      blockType: 'mediaBlock',
      media: mediaId,
      position: 'default',
      blockName: '',
    },
    format: '',
    version: 2,
  }
}

function convertCodeBlock(node: WixRichContentNode): LexicalNode {
  const codeText = extractPlainText(node.nodes)

  return {
    type: 'block',
    fields: {
      blockType: 'code',
      code: codeText,
      language: 'typescript',
      blockName: '',
    },
    format: '',
    version: 2,
  }
}

function convertEmbed(node: WixRichContentNode): LexicalParagraphNode {
  const url = node.embedData?.oembed?.url || node.embedData?.src || ''
  const title = node.embedData?.oembed?.title || 'Embedded content'

  return {
    type: 'paragraph',
    children: [createTextNode(`[Embed: ${title}] ${url}`)],
    direction: 'ltr',
    format: '',
    indent: 0,
    textFormat: 0,
    version: 1,
  }
}

function convertHtml(node: WixRichContentNode): LexicalParagraphNode {
  const html = node.htmlData?.html || node.htmlData?.url || ''

  return {
    type: 'paragraph',
    children: [createTextNode(`[HTML Block] ${html.substring(0, 200)}`)],
    direction: 'ltr',
    format: '',
    indent: 0,
    textFormat: 0,
    version: 1,
  }
}

function convertCollapsibleList(
  node: WixRichContentNode,
  options?: RichTextConversionOptions,
): LexicalNode[] {
  const results: LexicalNode[] = []
  if (!node.nodes?.length) return results

  for (const item of node.nodes) {
    if (item.type !== 'COLLAPSIBLE_ITEM') continue

    const titleNode = item.nodes?.find((n) => n.type === 'COLLAPSIBLE_ITEM_TITLE')
    const bodyNode = item.nodes?.find((n) => n.type === 'COLLAPSIBLE_ITEM_BODY')

    if (titleNode) {
      results.push({
        type: 'heading',
        tag: 'h4',
        children: convertInlineChildren(
          titleNode.nodes?.find((n) => n.type === 'PARAGRAPH')?.nodes ?? titleNode.nodes,
        ),
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      } satisfies LexicalHeadingNode)
    }

    if (bodyNode?.nodes?.length) {
      results.push(...convertNodes(bodyNode.nodes, options))
    }
  }

  return results
}

function convertTable(node: WixRichContentNode): LexicalNode {
  // Tables aren't natively supported in default Lexical config;
  // convert to a series of paragraphs as a fallback
  const rows: LexicalNode[] = []

  if (node.nodes?.length) {
    for (const row of node.nodes) {
      if (row.type !== 'TABLE_ROW' || !row.nodes?.length) continue

      const cellTexts: string[] = []
      for (const cell of row.nodes) {
        if (cell.type !== 'TABLE_CELL') continue
        cellTexts.push(extractPlainText(cell.nodes))
      }

      rows.push({
        type: 'paragraph',
        children: [createTextNode(`| ${cellTexts.join(' | ')} |`)],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        version: 1,
      } satisfies LexicalParagraphNode)
    }
  }

  return rows.length
    ? rows[0]
    : ({
        type: 'paragraph',
        children: [createTextNode('[Table]')],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        version: 1,
      } satisfies LexicalParagraphNode)
}

function convertButton(node: WixRichContentNode): LexicalParagraphNode {
  const text = node.buttonData?.text || 'Button'
  const url = node.buttonData?.link?.url || '#'

  const linkNode: LexicalLinkNode = {
    type: 'link',
    children: [createTextNode(text, TEXT_FORMAT.BOLD)],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 3,
    fields: {
      linkType: 'custom',
      url,
      newTab: node.buttonData?.link?.target === '_blank',
    },
  }

  return {
    type: 'paragraph',
    children: [linkNode],
    direction: 'ltr',
    format: '',
    indent: 0,
    textFormat: 0,
    version: 1,
  }
}

// -- Utilities --

function extractPlainText(nodes?: WixRichContentNode[]): string {
  if (!nodes?.length) return ''

  return nodes
    .map((n) => {
      if (n.type === 'TEXT') return n.textData?.text ?? ''
      if (n.nodes?.length) return extractPlainText(n.nodes)
      return ''
    })
    .join('')
}

/**
 * Resolves a Wix image URL/ID to a full URL.
 * Wix stores images as either full URLs or `wix:image://v1/...` URIs.
 */
export function resolveWixImageUrl(urlOrId?: string): string {
  if (!urlOrId) return ''

  if (urlOrId.startsWith('http://') || urlOrId.startsWith('https://')) {
    return urlOrId
  }

  // Handle wix:image://v1/{fileId}/{filename} format
  if (urlOrId.startsWith('wix:image://')) {
    const parts = urlOrId.replace('wix:image://v1/', '').split('/')
    const fileId = parts[0]
    return `https://static.wixstatic.com/media/${fileId}`
  }

  // Handle wix:document://v1/ugd/{fileId}.ext/{name}.ext format
  if (urlOrId.startsWith('wix:document://')) {
    const match = urlOrId.match(/wix:document:\/\/v1\/ugd\/([^/]+)/)
    if (match?.[1]) {
      return `https://www.impgmtfund.com/_files/ugd/${match[1]}`
    }
  }

  // Handle plain file IDs
  if (urlOrId.includes('.')) {
    return `https://static.wixstatic.com/media/${urlOrId}`
  }

  return urlOrId
}

// -- Main conversion --

function convertNode(
  node: WixRichContentNode,
  options?: RichTextConversionOptions,
): LexicalNode | LexicalNode[] | null {
  if (node.type === 'COLLAPSIBLE_LIST') {
    return convertCollapsibleList(node, options)
  }
  if (node.type === 'PARAGRAPH') return convertParagraph(node)
  if (node.type === 'HEADING') return convertHeading(node)
  if (node.type === 'BULLETED_LIST') return convertBulletedList(node)
  if (node.type === 'ORDERED_LIST') return convertOrderedList(node)
  if (node.type === 'BLOCKQUOTE') return convertBlockquote(node)
  if (node.type === 'DIVIDER') return convertDivider()
  if (node.type === 'IMAGE') return convertImage(node, options)
  if (node.type === 'CODE_BLOCK') return convertCodeBlock(node)
  if (node.type === 'EMBED') return convertEmbed(node)
  if (node.type === 'HTML') return convertHtml(node)
  if (node.type === 'TABLE') return convertTable(node)
  if (node.type === 'BUTTON') return convertButton(node)
  if (node.type === 'GALLERY' && node.galleryData?.items?.length) {
    const galleryNodes: LexicalNode[] = []
    for (const item of node.galleryData.items) {
      const src = resolveWixImageUrl(item.image?.src?.url || item.image?.src?.id)
      if (!src) continue
      galleryNodes.push(
        convertImage(
          {
            type: 'IMAGE',
            imageData: {
              image: item.image,
              altText: item.altText,
            },
          },
          options,
        ),
      )
    }
    return galleryNodes
  }

  // Fallback: try to extract text content
  if (node.nodes?.length) {
    const text = extractPlainText(node.nodes)
    if (text.trim()) {
      return {
        type: 'paragraph',
        children: [createTextNode(text)],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        version: 1,
      } satisfies LexicalParagraphNode
    }
  }

  return null
}

function convertNodes(nodes: WixRichContentNode[], options?: RichTextConversionOptions): LexicalNode[] {
  const result: LexicalNode[] = []

  for (const node of nodes) {
    const converted = convertNode(node, options)
    if (converted === null) continue
    if (Array.isArray(converted)) {
      result.push(...converted)
    } else {
      result.push(converted)
    }
  }

  return result
}

/**
 * Converts Wix Rich Content (Ricos) to Payload CMS Lexical editor format.
 * Returns a complete Lexical serialized state.
 */
export function wixRichContentToLexical(
  richContent: WixRichContent,
  options?: RichTextConversionOptions,
): LexicalRoot {
  const children = convertNodes(richContent.nodes || [], options)

  // Ensure there's at least one paragraph
  if (children.length === 0) {
    children.push({
      type: 'paragraph',
      children: [createTextNode('')],
      direction: 'ltr',
      format: '',
      indent: 0,
      textFormat: 0,
      version: 1,
    } satisfies LexicalParagraphNode)
  }

  return {
    root: {
      type: 'root',
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

/**
 * Converts a plain text string to Lexical format, splitting on newlines.
 */
export function plainTextToLexical(text: string): LexicalRoot {
  const paragraphs = text.split(/\n\n|\r\n\r\n/).filter(Boolean)

  const children: LexicalNode[] = paragraphs.map(
    (p) =>
      ({
        type: 'paragraph',
        children: [createTextNode(p.trim())],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        version: 1,
      }) satisfies LexicalParagraphNode,
  )

  if (children.length === 0) {
    children.push({
      type: 'paragraph',
      children: [createTextNode('')],
      direction: 'ltr',
      format: '',
      indent: 0,
      textFormat: 0,
      version: 1,
    } satisfies LexicalParagraphNode)
  }

  return {
    root: {
      type: 'root',
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

/**
 * Extracts all image URLs from Wix Rich Content for pre-downloading.
 */
export function extractImagesFromRichContent(richContent: WixRichContent): string[] {
  const urls: string[] = []

  function walk(nodes: WixRichContentNode[]) {
    for (const node of nodes) {
      if (node.type === 'IMAGE' && node.imageData?.image?.src) {
        const url = resolveWixImageUrl(
          node.imageData.image.src.url || node.imageData.image.src.id,
        )
        if (url) urls.push(url)
      }
      if (node.type === 'GALLERY' && node.galleryData?.items) {
        for (const item of node.galleryData.items) {
          if (item.image?.src) {
            const url = resolveWixImageUrl(item.image.src.url || item.image.src.id)
            if (url) urls.push(url)
          }
        }
      }
      if (node.nodes?.length) {
        walk(node.nodes)
      }
    }
  }

  walk(richContent.nodes || [])
  return [...new Set(urls)]
}
