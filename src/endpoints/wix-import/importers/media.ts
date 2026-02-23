import type { Payload, File } from 'payload'
import type { ImportIdMap } from '../types'
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
  const cleanFilename = filename.split('?')[0]

  return {
    name: cleanFilename,
    data: Buffer.from(data),
    mimetype: contentType,
    size: data.byteLength,
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
    idMap?: ImportIdMap
  },
): Promise<number | string | null> {
  const resolvedUrl = resolveWixImageUrl(url)
  if (!resolvedUrl) return null

  if (options?.idMap?.media.has(resolvedUrl)) {
    return options.idMap.media.get(resolvedUrl) ?? null
  }

  if (options?.skipExisting) {
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
    const file = await fetchFileByURL(resolvedUrl)
    const doc = await payload.create({
      collection: 'media',
      data: { alt: options?.alt || '' },
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
    idMap?: ImportIdMap
    concurrency?: number
  },
): Promise<{ created: number; skipped: number; errors: string[] }> {
  const result = { created: 0, skipped: 0, errors: [] as string[] }
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
