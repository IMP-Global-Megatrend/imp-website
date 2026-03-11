// @ts-nocheck
import dotenv from 'dotenv'
import fs from 'node:fs/promises'
import path from 'node:path'

import mammoth from 'mammoth'
import { PDFParse } from 'pdf-parse'

import { plainTextToLexical } from '@/endpoints/wix-import/converters/rich-text'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const SOURCE_DIR = path.resolve(process.cwd(), 'docs/fund_commentaries')
const MARKDOWN_DIR = path.resolve(process.cwd(), 'docs/fund_commentaries_markdown')
const SOURCE_PREFIX = 'fund-commentary:'
const FUND_COMMENTARY_CATEGORY = 'Fund Commentary'
const KARIN_NAME = 'Karin Wiederkehr'
const KARIN_EMAIL = 'kbw@mrbpartner.ch'
const STEFAN_NAME = 'Stefan'
const STEFAN_EMAIL = 'sw@mrbpartner.ch'

type ImportOptions = {
  dryRun: boolean
  backfillOnly: boolean
}

type CommentaryFile = {
  filePath: string
  fileName: string
  ext: 'pdf' | 'docx'
  sourceId: string
  slug: string
  title: string
  publishedAtIso: string
}

function parseArgs(argv: string[]): ImportOptions {
  return {
    dryRun: argv.includes('--dry-run'),
    backfillOnly: argv.includes('--backfill-only'),
  }
}

function normalizeWhitespace(value: string): string {
  return value
    .replace(/\r\n/g, '\n')
    .replace(/\u0000/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function plainTextToMarkdown(value: string): string {
  if (!value) return ''
  const normalized = normalizeWhitespace(value)
  if (!normalized) return ''
  return normalized
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .join('\n\n')
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function formatHumanDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function parseCommentaryMetadata(fileName: string): CommentaryFile | null {
  const match = fileName.match(/^(\d{2})\.(\d{2})\.(\d{4})\s+(.+)\.(pdf|docx)$/i)
  if (!match) return null

  const [, dd, mm, yyyy, rawTitle, extRaw] = match
  const day = Number(dd)
  const month = Number(mm)
  const year = Number(yyyy)
  const ext = extRaw.toLowerCase() as 'pdf' | 'docx'
  const publishedAt = new Date(Date.UTC(year, month - 1, day, 12, 0, 0))

  if (Number.isNaN(publishedAt.getTime())) return null

  const cleanedTitle = rawTitle.replace(/\s+pdf$/i, '').trim()
  const slug = `fund-commentary-${yyyy}-${mm}-${dd}`
  const sourceIdBase = path.basename(fileName, path.extname(fileName))

  return {
    filePath: path.join(SOURCE_DIR, fileName),
    fileName,
    ext,
    sourceId: `${SOURCE_PREFIX}${toSlug(sourceIdBase)}`,
    slug,
    title: `${cleanedTitle} - ${formatHumanDate(publishedAt)}`,
    publishedAtIso: publishedAt.toISOString(),
  }
}

async function loadCommentaryFiles(): Promise<CommentaryFile[]> {
  const dirEntries = await fs.readdir(SOURCE_DIR, { withFileTypes: true })
  const allFiles = dirEntries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => /\.(pdf|docx)$/i.test(name))
    .sort((a, b) => a.localeCompare(b))

  const fileSet = new Set(allFiles)
  const selected: CommentaryFile[] = []
  for (const fileName of allFiles) {
    if (fileName.endsWith('-1.docx')) {
      const canonical = fileName.replace(/-1\.docx$/i, '.docx')
      if (fileSet.has(canonical)) {
        continue
      }
    }

    const parsed = parseCommentaryMetadata(fileName)
    if (!parsed) continue
    selected.push(parsed)
  }

  return selected.sort((a, b) => new Date(a.publishedAtIso).getTime() - new Date(b.publishedAtIso).getTime())
}

async function extractDocx(filePath: string): Promise<{ plainText: string; markdown: string }> {
  const [rawTextResult, markdownResult] = await Promise.all([
    mammoth.extractRawText({ path: filePath }),
    mammoth.convertToMarkdown({ path: filePath }),
  ])

  const plainText = normalizeWhitespace(rawTextResult.value || '')
  const markdown = plainTextToMarkdown(markdownResult.value || plainText)
  return { plainText, markdown }
}

async function extractPdf(filePath: string): Promise<{ plainText: string; markdown: string }> {
  const fileBuffer = await fs.readFile(filePath)
  const parser = new PDFParse({ data: fileBuffer })
  try {
    const textResult = await parser.getText()
    const plainText = normalizeWhitespace(textResult.text || '')
    return {
      plainText,
      markdown: plainTextToMarkdown(plainText),
    }
  } finally {
    await parser.destroy()
  }
}

async function writeMarkdownFile(entry: CommentaryFile, markdown: string): Promise<string> {
  await fs.mkdir(MARKDOWN_DIR, { recursive: true })
  const outName = `${entry.slug}.md`
  const outPath = path.join(MARKDOWN_DIR, outName)
  const frontmatter = [
    '---',
    `title: "${entry.title.replace(/"/g, '\\"')}"`,
    `source_file: "${entry.fileName.replace(/"/g, '\\"')}"`,
    `source_id: "${entry.sourceId}"`,
    `published_at: "${entry.publishedAtIso}"`,
    'category: "Fund Commentary"',
    'author: "Karin Wiederkehr, Stefan Wiederkehr"',
    '---',
    '',
  ].join('\n')

  const body = markdown.trim() ? markdown.trim() : '_No text extracted from source document._'
  await fs.writeFile(outPath, `${frontmatter}${body}\n`, 'utf8')
  return outPath
}

async function ensureFundCommentaryCategory(payload: any, dryRun: boolean): Promise<string> {
  const existing = await payload.find({
    collection: 'categories',
    where: { title: { equals: FUND_COMMENTARY_CATEGORY } },
    limit: 1,
    pagination: false,
    depth: 0,
  })

  const found = existing.docs?.[0]
  if (found?.id) return found.id

  if (dryRun) return 'dry-run:fund-commentary-category'

  const created = await payload.create({
    collection: 'categories',
    depth: 0,
    data: {
      title: FUND_COMMENTARY_CATEGORY,
      slug: 'fund-commentary',
      sourceId: 'manual:fund-commentary',
    },
  })
  return created.id
}

function normalizeName(value: string | null | undefined): string {
  return (value || '').trim().toLowerCase()
}

function findPreferredUserByName(users: Array<{ id: string | number; name?: string }>, query: string) {
  const normalizedQuery = normalizeName(query)
  if (!normalizedQuery) return null

  const exact = users.find((user) => normalizeName(user.name) === normalizedQuery)
  if (exact) return exact

  const startsWith = users.find((user) => normalizeName(user.name).startsWith(normalizedQuery))
  if (startsWith) return startsWith

  return null
}

function findPreferredUserByEmail(
  users: Array<{ id: string | number; email?: string }>,
  email: string,
) {
  const normalizedTarget = (email || '').trim().toLowerCase()
  if (!normalizedTarget) return null
  return users.find((user) => (user.email || '').trim().toLowerCase() === normalizedTarget) || null
}

async function ensureAuthors(payload: any, dryRun: boolean): Promise<Array<string | number>> {
  const usersResult = await payload.find({
    collection: 'users',
    limit: 500,
    pagination: false,
    depth: 0,
  })

  const users = (usersResult.docs || []).map((doc: any) => ({
    id: doc.id,
    name: typeof doc.name === 'string' ? doc.name : '',
    email: typeof doc.email === 'string' ? doc.email : '',
  }))

  const karin = findPreferredUserByEmail(users, KARIN_EMAIL) || findPreferredUserByName(users, KARIN_NAME)
  const stefan =
    findPreferredUserByEmail(users, STEFAN_EMAIL) || findPreferredUserByName(users, STEFAN_NAME)

  if (!karin || !stefan) {
    if (dryRun) return ['dry-run:karin-author', 'dry-run:stefan-author']
    throw new Error(
      `Required authors not found in Payload users. karinFound=${Boolean(karin)} stefanFound=${Boolean(stefan)}`,
    )
  }

  return [karin.id, stefan.id]
}

function pickImageId(doc: any): string | number | null {
  if (!doc || typeof doc !== 'object') return null
  if (doc.heroImage) return typeof doc.heroImage === 'object' ? doc.heroImage.id : doc.heroImage
  if (doc.meta?.image) return typeof doc.meta.image === 'object' ? doc.meta.image.id : doc.meta.image
  return null
}

async function resolveDefaultImageId(payload: any): Promise<string | number | null> {
  const latestPublished = await payload.find({
    collection: 'posts',
    where: { _status: { equals: 'published' } },
    sort: '-publishedAt',
    limit: 50,
    pagination: false,
    depth: 0,
  })

  for (const doc of latestPublished.docs || []) {
    const id = pickImageId(doc)
    if (id) return id
  }

  return null
}

function extractMetaDescription(plainText: string): string {
  if (!plainText) return ''
  const singleLine = plainText.replace(/\s+/g, ' ').trim()
  if (singleLine.length <= 220) return singleLine
  return `${singleLine.slice(0, 217).trim()}...`
}

async function upsertCommentaryPost(
  payload: any,
  entry: CommentaryFile,
  plainText: string,
  categoryId: string | number,
  authorIds: Array<string | number>,
  defaultImageId: string | number | null,
  dryRun: boolean,
): Promise<'created' | 'updated'> {
  const existing = await payload.find({
    collection: 'posts',
    where: { sourceId: { equals: entry.sourceId } },
    limit: 1,
    pagination: false,
    depth: 0,
  })
  const existingDoc = existing.docs?.[0]
  const existingHero = existingDoc?.heroImage
  const existingMetaImage = existingDoc?.meta?.image
  const resolvedHero = existingHero || defaultImageId || null
  const resolvedMetaImage = existingMetaImage || resolvedHero || null
  const metaDescription = extractMetaDescription(plainText)

  const data: Record<string, unknown> = {
    title: entry.title,
    slug: entry.slug,
    sourceId: entry.sourceId,
    sourceUpdatedAt: new Date().toISOString(),
    publishedAt: entry.publishedAtIso,
    categories: [categoryId],
    authors: authorIds,
    content: plainTextToLexical(plainText),
    meta: {
      title: entry.title,
      description: metaDescription,
      image: resolvedMetaImage || undefined,
    },
    _status: 'published',
  }

  if (resolvedHero) {
    data.heroImage = resolvedHero
  }

  if (existingDoc?.id) {
    if (!dryRun) {
      await payload.update({
        collection: 'posts',
        id: existingDoc.id,
        depth: 0,
        draft: false,
        data,
        context: { disableRevalidate: true },
      })
    }
    return 'updated'
  }

  if (!dryRun) {
    await payload.create({
      collection: 'posts',
      depth: 0,
      draft: false,
      data,
      context: { disableRevalidate: true },
    })
  }
  return 'created'
}

async function backfillPostImages(
  payload: any,
  defaultImageId: string | number | null,
  dryRun: boolean,
): Promise<{ scanned: number; updated: number; skipped: number }> {
  if (!defaultImageId) {
    return { scanned: 0, updated: 0, skipped: 0 }
  }

  let page = 1
  const limit = 100
  let scanned = 0
  let updated = 0
  let skipped = 0
  let hasNext = true

  while (hasNext) {
    const result = await payload.find({
      collection: 'posts',
      depth: 0,
      page,
      limit,
      sort: '-updatedAt',
    })

    for (const doc of result.docs || []) {
      scanned += 1
      const heroImage = doc.heroImage
      const metaImage = doc.meta?.image
      if (heroImage && metaImage) {
        skipped += 1
        continue
      }

      const nextHero = heroImage || defaultImageId
      const nextMeta = {
        ...(doc.meta || {}),
        image: metaImage || nextHero || defaultImageId,
      }

      if (!dryRun) {
        await payload.update({
          collection: 'posts',
          id: doc.id,
          depth: 0,
          draft: false,
          data: {
            heroImage: nextHero,
            meta: nextMeta,
          },
          context: { disableRevalidate: true },
        })
      }

      updated += 1
    }

    hasNext = Boolean(result.hasNextPage)
    page += 1
  }

  return { scanned, updated, skipped }
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const [{ default: config }, { getPayload }] = await Promise.all([
    import('@payload-config'),
    import('payload'),
  ])
  const payload = await getPayload({ config })

  const defaultImageId = await resolveDefaultImageId(payload)
  const categoryId = await ensureFundCommentaryCategory(payload, options.dryRun)
  const authorIds = await ensureAuthors(payload, options.dryRun)

  const summary = {
    options,
    discovered: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    markdownFiles: [] as string[],
    defaultImageId,
    backfill: { scanned: 0, updated: 0, skipped: 0 },
  }

  if (!options.backfillOnly) {
    const files = await loadCommentaryFiles()
    summary.discovered = files.length

    for (const entry of files) {
      const extraction =
        entry.ext === 'docx' ? await extractDocx(entry.filePath) : await extractPdf(entry.filePath)
      const markdownPath = await writeMarkdownFile(entry, extraction.markdown)
      summary.markdownFiles.push(path.relative(process.cwd(), markdownPath))

      if (!extraction.plainText.trim()) {
        summary.skipped += 1
        payload.logger.warn(`Skipping ${entry.fileName} because extracted text is empty.`)
        continue
      }

      const result = await upsertCommentaryPost(
        payload,
        entry,
        extraction.plainText,
        categoryId,
        authorIds,
        defaultImageId,
        options.dryRun,
      )
      summary[result] += 1
    }
  }

  summary.backfill = await backfillPostImages(payload, defaultImageId, options.dryRun)

  console.log(JSON.stringify(summary, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
