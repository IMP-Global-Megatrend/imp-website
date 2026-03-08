// Wix Blog API response types
// Reference: https://dev.wix.com/docs/rest/articles/getting-started/api-keys

export interface WixApiConfig {
  apiKey: string
  siteId: string
  accountId: string
}

// -- Wix Blog Post --

export interface WixBlogPost {
  id: string
  title: string
  excerpt?: string
  richContent?: WixRichContent
  /** @deprecated Wix legacy format */
  plainContent?: string
  slug: string
  featured: boolean
  pinned: boolean
  categoryIds: string[]
  coverImage?: WixCoverImage
  publishedDate?: string
  lastPublishedDate?: string
  firstPublishedDate?: string
  language?: string
  translationId?: string
  status: 'PUBLISHED' | 'DRAFT' | 'UNPUBLISHED'
  memberId?: string
  hashtags?: string[]
  commentingEnabled?: boolean
  minutesToRead?: number
  tagIds?: string[]
  pricingPlanIds?: string[]
  seoData?: WixSeoData
  heroImage?: WixCoverImage
  moderationDetails?: {
    status: string
  }
  internalId?: string
  editedDate?: string
  media?: WixMediaItem
}

export interface WixCoverImage {
  url: string
  width?: number
  height?: number
  displayed?: boolean
  custom?: boolean
  id?: string
}

export interface WixSeoData {
  tags?: Array<{
    type: string
    props?: Record<string, string>
    children?: string
  }>
  settings?: {
    preventAutoRedirect?: boolean
    keywords?: Array<{ term: string; isMain: boolean }>
  }
}

// -- Wix Rich Content (Ricos) format --

export interface WixRichContent {
  nodes: WixRichContentNode[]
  metadata?: {
    version: number
    createdTimestamp?: string
    updatedTimestamp?: string
    id?: string
  }
}

export interface WixRichContentNode {
  type: WixNodeType
  id?: string
  nodes?: WixRichContentNode[]
  // Data fields vary by node type
  paragraphData?: WixParagraphData
  headingData?: WixHeadingData
  textData?: WixTextData
  imageData?: WixImageData
  videoData?: WixVideoData
  galleryData?: WixGalleryData
  bulletedListData?: Record<string, unknown>
  orderedListData?: Record<string, unknown>
  listItemData?: WixListItemData
  blockquoteData?: Record<string, unknown>
  codeBlockData?: WixCodeBlockData
  dividerData?: WixDividerData
  htmlData?: WixHtmlData
  embedData?: WixEmbedData
  linkPreviewData?: WixLinkPreviewData
  tableData?: WixTableData
  collapsibleListData?: WixCollapsibleListData
  buttonData?: WixButtonData
  fileData?: WixFileData
}

export type WixNodeType =
  | 'PARAGRAPH'
  | 'HEADING'
  | 'TEXT'
  | 'IMAGE'
  | 'VIDEO'
  | 'GALLERY'
  | 'BULLETED_LIST'
  | 'ORDERED_LIST'
  | 'LIST_ITEM'
  | 'BLOCKQUOTE'
  | 'CODE_BLOCK'
  | 'DIVIDER'
  | 'HTML'
  | 'EMBED'
  | 'LINK_PREVIEW'
  | 'TABLE'
  | 'TABLE_ROW'
  | 'TABLE_CELL'
  | 'COLLAPSIBLE_LIST'
  | 'COLLAPSIBLE_ITEM'
  | 'COLLAPSIBLE_ITEM_TITLE'
  | 'COLLAPSIBLE_ITEM_BODY'
  | 'BUTTON'
  | 'FILE'

export interface WixParagraphData {
  textStyle?: {
    textAlignment?: 'AUTO' | 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFY'
  }
  indentation?: number
}

export interface WixHeadingData {
  level: 1 | 2 | 3 | 4 | 5 | 6
  textStyle?: {
    textAlignment?: 'AUTO' | 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFY'
  }
  indentation?: number
}

export interface WixTextData {
  text: string
  decorations?: WixTextDecoration[]
}

export interface WixTextDecoration {
  type:
    | 'BOLD'
    | 'ITALIC'
    | 'UNDERLINE'
    | 'SPOILER'
    | 'ANCHOR'
    | 'MENTION'
    | 'LINK'
    | 'COLOR'
    | 'FONT_SIZE'
    | 'EXTERNAL'
  fontWeightValue?: number
  italicData?: boolean
  underlineData?: boolean
  anchorData?: { anchor: string }
  linkData?: { link: WixLink }
  colorData?: { foreground?: string; background?: string }
  fontSizeData?: { value?: number; unit?: string }
}

export interface WixLink {
  url?: string
  target?: '_blank' | '_self'
  rel?: {
    nofollow?: boolean
    sponsored?: boolean
    ugc?: boolean
    noreferrer?: boolean
  }
  anchor?: string
  customData?: string
}

export interface WixImageData {
  containerData?: WixContainerData
  image?: {
    src?: { url?: string; id?: string; private?: boolean }
    width?: number
    height?: number
    altText?: string
    caption?: string
  }
  disableExpand?: boolean
  altText?: string
  caption?: string
}

export interface WixVideoData {
  containerData?: WixContainerData
  video?: {
    src?: { url?: string; id?: string }
    duration?: number
    thumbnail?: string
  }
  title?: string
}

export interface WixGalleryData {
  containerData?: WixContainerData
  items?: Array<{
    image?: WixImageData['image']
    video?: WixVideoData['video']
    title?: string
    altText?: string
  }>
  options?: Record<string, unknown>
}

export interface WixContainerData {
  width?: { size?: string }
  alignment?: 'CENTER' | 'LEFT' | 'RIGHT'
  textWrap?: boolean
}

export interface WixListItemData {
  indentation?: number
}

export interface WixCodeBlockData {
  textStyle?: { textAlignment?: string }
}

export interface WixDividerData {
  containerData?: WixContainerData
  lineStyle?: 'SINGLE' | 'DOUBLE' | 'DASHED' | 'DOTTED'
  width?: 'LARGE' | 'MEDIUM' | 'SMALL'
  alignment?: 'CENTER' | 'LEFT' | 'RIGHT'
}

export interface WixHtmlData {
  containerData?: WixContainerData
  html?: string
  url?: string
}

export interface WixEmbedData {
  containerData?: WixContainerData
  oembed?: {
    type?: string
    width?: number
    height?: number
    title?: string
    url?: string
    html?: string
    thumbnailUrl?: string
    videoUrl?: string
  }
  src?: string
}

export interface WixLinkPreviewData {
  containerData?: WixContainerData
  link?: WixLink
  title?: string
  description?: string
  thumbnailUrl?: string
  html?: string
}

export interface WixTableData {
  containerData?: WixContainerData
  dimensions?: { colsWidthRatio?: number[]; rowsHeight?: number[]; colsMinWidth?: number[] }
  header?: boolean
}

export interface WixCollapsibleListData {
  containerData?: WixContainerData
  expandOnlyOne?: boolean
  initialExpandedItems?: 'FIRST' | 'ALL' | 'NONE'
  direction?: 'LTR' | 'RTL'
}

export interface WixButtonData {
  containerData?: WixContainerData
  type?: 'LINK' | 'ACTION'
  styles?: {
    border?: { width?: number; radius?: number }
    colors?: { text?: string; border?: string; background?: string }
  }
  text?: string
  link?: WixLink
}

export interface WixFileData {
  containerData?: WixContainerData
  src?: { url?: string; id?: string; private?: boolean }
  name?: string
  type?: string
  size?: number
  pdfSettings?: { viewMode?: string; disableDownload?: boolean }
}

// -- Wix Blog Category --

export interface WixBlogCategory {
  id: string
  label: string
  slug: string
  postCount?: number
  description?: string
  title?: string
  coverImage?: WixCoverImage
  displayPosition?: number
  language?: string
  translationId?: string
  seoData?: WixSeoData
}

// -- Wix Data Collection Item (CMS) --

export interface WixDataItem {
  id: string
  data: Record<string, unknown>
  _createdDate?: string
  _updatedDate?: string
}

// -- Wix Site Page --

export interface WixSitePage {
  id: string
  title?: string
  pageTitle?: string
  slug?: string
  path?: string
  seoData?: WixSeoData
  richContent?: WixRichContent
  plainContent?: string
  coverImage?: WixCoverImage
  heroImage?: WixCoverImage
  firstPublishedDate?: string
  publishedDate?: string
  status?: 'PUBLISHED' | 'DRAFT' | 'UNPUBLISHED'
  updatedDate?: string
  [key: string]: unknown
}

// -- Wix Media Item --

export interface WixMediaItem {
  wixMedia?: {
    image?: string
    video?: string
  }
  custom?: boolean
  displayed?: boolean
  enabled?: boolean
}

// -- API Response Wrappers --

export interface WixPaginatedResponse<T> {
  items?: T[]
  metaData?: {
    count: number
    offset: number
    total: number
  }
  pagingMetadata?: {
    count: number
    offset: number
    total: number
    hasNext: boolean
  }
}

export interface WixBlogPostsResponse {
  posts: WixBlogPost[]
  metaData: {
    count: number
    offset: number
    total: number
  }
}

export interface WixBlogCategoriesResponse {
  categories: WixBlogCategory[]
  metaData: {
    count: number
    offset: number
    total: number
  }
}

// -- Import Options --

export interface WixImportOptions {
  /** Import blog posts */
  posts?: boolean
  /** Import blog categories */
  categories?: boolean
  /** Import Wix site pages */
  pages?: boolean
  /** Import media (images from posts/pages) */
  media?: boolean
  /** Import Wix Data collections (CMS items) */
  dataCollections?: string[]
  /** Skip existing items (match by slug) */
  skipExisting?: boolean
  /** Update existing docs when a matching sourceId/slug exists */
  upsertByWixId?: boolean
  /** Do not write to the database, only log/report actions */
  dryRun?: boolean
  /** Publish imported items immediately */
  publishOnImport?: boolean
  /** Maximum posts to import (for testing) */
  limit?: number
  /** Offset for paginated import */
  offset?: number
}

export interface ImportEntityResult {
  created: number
  updated: number
  skipped: number
  errors: string[]
}

export interface WixImportResult {
  categories: ImportEntityResult
  media: ImportEntityResult
  posts: ImportEntityResult
  pages: ImportEntityResult
  dataCollections: ImportEntityResult
}

// Maps Wix IDs to Payload IDs for cross-referencing during import
export interface ImportIdMap {
  categories: Map<string, number | string>
  media: Map<string, number | string>
  posts: Map<string, number | string>
  pages: Map<string, number | string>
}
