// @ts-nocheck
import dotenv from 'dotenv'
import path from 'node:path'
import { readdir, readFile } from 'node:fs/promises'
import { getPayload, type File } from 'payload'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const OG_DIR = path.resolve('public/images/og/generated')

function buildOgSourceUrl(relativePath: string): string {
  return `/images/og/generated/${relativePath}`
}

function humanizeLabel(value: string): string {
  return value
    .replace(/\.png$/i, '')
    .replace(/[_/.-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function buildAlt(relativePath: string): string {
  return `${humanizeLabel(relativePath)} Open Graph image`
}

function pageSlugFromRelativePath(relativePath: string): string | null {
  if (!relativePath.startsWith('pages/')) return null
  const file = relativePath.replace(/^pages\//, '')
  const slug = file.replace(/\.png$/i, '')
  return slug || null
}

async function listGeneratedOgFiles(rootDir: string): Promise<string[]> {
  const entries = await readdir(rootDir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const absolutePath = path.join(rootDir, entry.name)
    if (entry.isDirectory()) {
      const nested = await listGeneratedOgFiles(absolutePath)
      files.push(...nested.map((nestedPath) => path.join(entry.name, nestedPath)))
      continue
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith('.png')) {
      files.push(entry.name)
    }
  }

  return files
}

async function toPayloadFile(relativePath: string): Promise<File> {
  const absolutePath = path.join(OG_DIR, relativePath)
  const data = await readFile(absolutePath)
  return {
    name: path.basename(relativePath),
    data,
    mimetype: 'image/png',
    size: data.byteLength,
  }
}

async function upsertOgMedia(payload: Awaited<ReturnType<typeof getPayload>>, relativePath: string) {
  const sourceUrl = buildOgSourceUrl(relativePath)
  const alt = buildAlt(relativePath)
  const existing = await payload.find({
    collection: 'media',
    where: { sourceUrl: { equals: sourceUrl } },
    limit: 1,
    pagination: false,
    depth: 0,
  })

  const existingDoc = existing.docs?.[0]
  if (existingDoc) {
    await payload.update({
      collection: 'media',
      id: existingDoc.id,
      data: {
        alt,
        sourceUrl,
      },
      depth: 0,
    })
    return existingDoc.id
  }

  const file = await toPayloadFile(relativePath)
  const created = await payload.create({
    collection: 'media',
    data: {
      alt,
      sourceUrl,
    },
    file,
    depth: 0,
  })

  return created.id
}

async function linkOgToPage(payload: Awaited<ReturnType<typeof getPayload>>, slug: string, mediaId: number) {
  const pageResult = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    limit: 1,
    pagination: false,
    depth: 0,
  })

  const page = pageResult.docs?.[0]
  if (!page) return false

  await payload.update({
    collection: 'pages',
    id: page.id,
    data: {
      meta: {
        ...(page.meta || {}),
        image: mediaId,
      },
    },
    depth: 0,
    context: {
      disableRevalidate: true,
    },
  })

  return true
}

async function main() {
  const { default: config } = await import('@payload-config')
  const payload = await getPayload({ config })
  const ogFiles = await listGeneratedOgFiles(OG_DIR)

  let linkedCount = 0
  let uploadedCount = 0
  const skippedLinks: string[] = []

  for (const relativePath of ogFiles) {
    const mediaId = await upsertOgMedia(payload, relativePath)
    uploadedCount += 1
    payload.logger.info(`[og-images] upserted ${relativePath} (media #${mediaId})`)

    const pageSlug = pageSlugFromRelativePath(relativePath)
    if (!pageSlug) continue

    const linked = await linkOgToPage(payload, pageSlug, mediaId)
    if (linked) {
      linkedCount += 1
      payload.logger.info(`[og-images] linked ${relativePath} -> page "${pageSlug}" (media #${mediaId})`)
      continue
    }

    skippedLinks.push(pageSlug)
    payload.logger.warn(`[og-images] page "${pageSlug}" not found; uploaded ${relativePath} only`)
  }

  payload.logger.info(`[og-images] uploaded ${uploadedCount} generated OG assets`)
  payload.logger.info(`[og-images] linked ${linkedCount} generated page OG assets to page.meta.image`)
  if (skippedLinks.length > 0) {
    payload.logger.warn(`[og-images] page links skipped (missing slug): ${skippedLinks.join(', ')}`)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
