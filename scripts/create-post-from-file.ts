/**
 * Create or update a Payload article from .docx, .rtf, or macOS .rtfd (reads TXT.rtf).
 *
 *   pnpm exec tsx scripts/create-post-from-file.ts <path> [options]
 *
 * Options:
 *   --title "..."          Title (default: parent folder name without .rtfd / .docx / trailing " EN")
 *   --slug ...             Slug (default: derived from title)
 *   --category-slug ...    Attach category if it exists (e.g. analysis)
 *   --update               Update existing post (--slug required)
 *   --dry-run
 */
import dotenv from 'dotenv'
import fs from 'node:fs/promises'
import path from 'node:path'

import { plainTextToLexical } from '@/endpoints/wix-import/converters/rich-text'

import { readArticleSourcePlainText } from './lib/readArticleSourceText'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

function extractMetaDescription(plainText: string): string {
  if (!plainText) return ''
  const singleLine = plainText.replace(/\s+/g, ' ').trim()
  if (singleLine.length <= 220) return singleLine
  return `${singleLine.slice(0, 217).trim()}...`
}

function defaultTitleFromPath(inputPath: string): string {
  let name = path.basename(inputPath)
  name = name.replace(/\.rtfd$/i, '').replace(/\.(docx|rtf)$/i, '').trim()
  return name.replace(/\s+EN\s*$/i, '').trim()
}

function slugFromTitle(title: string): string {
  return title
    .replace(/\u200b/g, '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
}

type Cli = {
  inputPath: string
  title?: string
  slug?: string
  categorySlug?: string
  update: boolean
  dryRun: boolean
}

function parseArgs(argv: string[]): Cli {
  let title: string | undefined
  let slug: string | undefined
  let categorySlug: string | undefined
  let update = false
  let dryRun = false
  const positional: string[] = []

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--title') {
      title = argv[++i]
      continue
    }
    if (a === '--slug') {
      slug = argv[++i]
      continue
    }
    if (a === '--category-slug') {
      categorySlug = argv[++i]
      continue
    }
    if (a === '--update') {
      update = true
      continue
    }
    if (a === '--dry-run') {
      dryRun = true
      continue
    }
    if (a?.startsWith('-')) continue
    if (a) positional.push(a)
  }

  const inputPath = positional[0]
  if (!inputPath) {
    throw new Error(
      'Missing source path.\nUsage: pnpm exec tsx scripts/create-post-from-file.ts <.docx|.rtf|.rtfd> [--title ...] [--slug ...] [--category-slug analysis] [--update] [--dry-run]',
    )
  }

  return { inputPath: path.resolve(inputPath), title, slug, categorySlug, update, dryRun }
}

async function resolveCategoryId(
  payload: Awaited<ReturnType<(typeof import('payload'))['getPayload']>>,
  categorySlug: string,
): Promise<number | undefined> {
  const res = await payload.find({
    collection: 'categories',
    where: { slug: { equals: categorySlug } },
    limit: 1,
    pagination: false,
    depth: 0,
  })
  const id = res.docs?.[0]?.id
  return typeof id === 'number' ? id : undefined
}

async function main() {
  const cli = parseArgs(process.argv.slice(2))
  await fs.access(cli.inputPath).catch(() => {
    throw new Error(`Path not found: ${cli.inputPath}`)
  })

  const plainText = await readArticleSourcePlainText(cli.inputPath)
  if (!plainText) throw new Error('No text extracted from the source.')

  const fileTitle = defaultTitleFromPath(cli.inputPath)
  const title = (cli.title || fileTitle).trim()
  if (!title) throw new Error('Title is empty.')

  const slug = (cli.slug || slugFromTitle(title)).trim()
  if (!slug) throw new Error('Slug is empty.')

  const [{ default: config }, { getPayload }] = await Promise.all([
    import('@payload-config'),
    import('payload'),
  ])
  const payload = await getPayload({ config })

  const content = plainTextToLexical(plainText)
  const metaDescription = extractMetaDescription(plainText)

  const categoryIds: number[] = []
  if (cli.categorySlug) {
    const cid = await resolveCategoryId(payload, cli.categorySlug)
    if (cid != null) categoryIds.push(cid)
  }

  const existing = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug } },
    limit: 1,
    pagination: false,
    depth: 0,
  })
  const existingDoc = existing.docs?.[0]

  if (cli.update) {
    if (!existingDoc?.id) {
      throw new Error(`No post found with slug "${slug}" to update.`)
    }
    const data: Record<string, unknown> = {
      content,
      meta: {
        ...(existingDoc.meta && typeof existingDoc.meta === 'object' ? existingDoc.meta : {}),
        title: existingDoc.title || title,
        description: metaDescription,
      },
      sourceUpdatedAt: new Date().toISOString(),
    }
    if (cli.title) data.title = title
    if (categoryIds.length) {
      const prev = Array.isArray(existingDoc.categories)
        ? existingDoc.categories
            .map((c) => (typeof c === 'object' && c && 'id' in c ? (c as { id: number }).id : c))
            .filter((id): id is number => typeof id === 'number')
        : []
      data.categories = [...new Set([...prev, ...categoryIds])]
    }

    if (cli.dryRun) {
      console.log(JSON.stringify({ dryRun: true, update: true, slug, dataKeys: Object.keys(data) }, null, 2))
      return
    }

    await payload.update({
      collection: 'posts',
      id: existingDoc.id,
      depth: 0,
      draft: false,
      data,
      context: { disableRevalidate: true },
    })

    console.log(JSON.stringify({ success: true, action: 'updated', id: existingDoc.id, slug, url: `/articles/${slug}` }, null, 2))
    return
  }

  if (existingDoc) {
    throw new Error(`Post with slug "${slug}" already exists. Use --update --slug ${slug} to replace body text.`)
  }

  const sourceId = `manual:file:${slug}`
  const dupSource = await payload.find({
    collection: 'posts',
    where: { sourceId: { equals: sourceId } },
    limit: 1,
    pagination: false,
    depth: 0,
  })
  if (dupSource.docs?.[0]) {
    throw new Error(`A post with sourceId "${sourceId}" already exists.`)
  }

  const data = {
    title,
    slug,
    sourceId,
    sourceUpdatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    content,
    categories: categoryIds.length ? categoryIds : undefined,
    meta: {
      title,
      description: metaDescription,
    },
    _status: 'published' as const,
  }

  if (cli.dryRun) {
    console.log(JSON.stringify({ dryRun: true, slug, title, sourceId, categoryIds }, null, 2))
    return
  }

  const created = await payload.create({
    collection: 'posts',
    depth: 0,
    draft: false,
    data,
    context: { disableRevalidate: true },
  })

  console.log(
    JSON.stringify(
      {
        success: true,
        action: 'created',
        id: created.id,
        slug,
        title,
        url: `/articles/${slug}`,
      },
      null,
      2,
    ),
  )
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
