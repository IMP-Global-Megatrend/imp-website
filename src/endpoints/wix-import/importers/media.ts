import type { Payload, File } from 'payload'
import type { ImportEntityResult, ImportIdMap } from '../types'
import { resolveWixImageUrl } from '../converters/rich-text'

/**
 * Downloads a file from a URL and returns a Payload-compatible File object.
 */
async function fetchFileByURL(url: string): Promise<File> {
  const res = await fetch(url, { method: 'GET' })

  if (!res.ok) {
    throw new Error(`Failed to fetch file from ${url}: ${res.status} ${res.statusText}`)
  }

  const data = await res.arrayBuffer()
  const contentType = res.headers.get('content-type') || 'image/jpeg'

  const urlPath = new URL(url).pathname
  const filename = urlPath.split('/').pop() || `wix-media-${Date.now()}`
  const cleanFilename = sanitizeFilename(filename.split('?')[0])

  return {
    name: cleanFilename,
    data: Buffer.from(data),
    mimetype: contentType,
    size: data.byteLength,
  }
}

function sanitizeFilename(filename: string): string {
  const lastDot = filename.lastIndexOf('.')
  const hasExt = lastDot > 0 && lastDot < filename.length - 1
  const base = hasExt ? filename.slice(0, lastDot) : filename
  const ext = hasExt ? filename.slice(lastDot + 1) : ''

  const safeBase = base
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 180)

  const safeExt = ext.replace(/[^a-zA-Z0-9]+/g, '').slice(0, 10)
  if (!safeBase && safeExt) return `wix-media-${Date.now()}.${safeExt}`
  if (!safeBase) return `wix-media-${Date.now()}`
  return safeExt ? `${safeBase}.${safeExt}` : safeBase
}

function buildAltText({ explicitAlt, filename, url }: { explicitAlt?: string; filename: string; url: string }): string {
  const cleanedExplicitAlt = explicitAlt?.trim()
  if (cleanedExplicitAlt) return cleanedExplicitAlt

  const withoutExt = filename.replace(/\.[a-zA-Z0-9]+$/, '')
  const humanized = withoutExt
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (humanized) {
    return humanized.charAt(0).toUpperCase() + humanized.slice(1)
  }

  try {
    const pathname = new URL(url).pathname
    const fallbackName = pathname.split('/').pop() || 'Imported image'
    return fallbackName
      .replace(/\.[a-zA-Z0-9]+$/, '')
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() || 'Imported image'
  } catch {
    return 'Imported image'
  }
}

/**
 * Imports a single image by URL into the Payload media collection.
 * Returns the created document's ID, or an existing one if skipExisting is true.
 */
export async function importMediaByUrl(
  payload: Payload,
  url: string,
  options?: {
    alt?: string
    skipExisting?: boolean
    dryRun?: boolean
    idMap?: ImportIdMap
  },
): Promise<number | string | null> {
  const resolvedUrl = resolveWixImageUrl(url)
  if (!resolvedUrl) return null

  if (options?.idMap?.media.has(resolvedUrl)) {
    return options.idMap.media.get(resolvedUrl) ?? null
  }

  if (options?.skipExisting) {
    const bySourceUrl = await payload.find({
      collection: 'media',
      where: { sourceUrl: { equals: resolvedUrl } },
      limit: 1,
      depth: 0,
    })
    if (bySourceUrl.docs.length > 0) {
      const id = bySourceUrl.docs[0].id
      options.idMap?.media.set(resolvedUrl, id)
      return id
    }

    const urlPath = new URL(resolvedUrl).pathname
    const filename = urlPath.split('/').pop()?.split('?')[0] || ''

    if (filename) {
      const existing = await payload.find({
        collection: 'media',
        where: { filename: { equals: filename } },
        limit: 1,
        depth: 0,
      })

      if (existing.docs.length > 0) {
        const id = existing.docs[0].id
        options.idMap?.media.set(resolvedUrl, id)
        return id
      }
    }
  }

  try {
    if (options?.dryRun) {
      return `dry-run:${resolvedUrl}`
    }

    const file = await fetchFileByURL(resolvedUrl)
    const doc = await payload.create({
      collection: 'media',
      data: {
        alt: buildAltText({
          explicitAlt: options?.alt,
          filename: file.name,
          url: resolvedUrl,
        }),
        sourceUrl: resolvedUrl,
      },
      file,
    })

    options?.idMap?.media.set(resolvedUrl, doc.id)
    return doc.id
  } catch (error) {
    payload.logger.error(`Failed to import media from ${resolvedUrl}: ${error}`)
    return null
  }
}

/**
 * Imports multiple images in batch, with concurrency control.
 */
export async function importMediaBatch(
  payload: Payload,
  urls: string[],
  options?: {
    skipExisting?: boolean
    dryRun?: boolean
    idMap?: ImportIdMap
    concurrency?: number
  },
): Promise<ImportEntityResult> {
  const result: ImportEntityResult = { created: 0, updated: 0, skipped: 0, errors: [] }
  const concurrency = options?.concurrency ?? 3
  const uniqueUrls = [...new Set(urls.map(resolveWixImageUrl).filter(Boolean))]

  for (let i = 0; i < uniqueUrls.length; i += concurrency) {
    const batch = uniqueUrls.slice(i, i + concurrency)
    const results = await Promise.allSettled(
      batch.map(async (url) => {
        if (options?.idMap?.media.has(url)) {
          result.skipped++
          return
        }

        const id = await importMediaByUrl(payload, url, {
          skipExisting: options?.skipExisting,
          dryRun: options?.dryRun,
          idMap: options?.idMap,
        })

        if (id) {
          result.created++
        } else {
          result.skipped++
        }
      }),
    )

    for (const r of results) {
      if (r.status === 'rejected') {
        result.errors.push(String(r.reason))
      }
    }
  }

  return result
}
