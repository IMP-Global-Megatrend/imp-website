import type { Payload } from 'payload'
import type { ImportEntityResult, ImportIdMap, WixSitePage } from '@/endpoints/wix-import/types'
import {
  extractImagesFromRichContent,
  plainTextToLexical,
  resolveWixImageUrl,
  wixRichContentToLexical,
} from '@/endpoints/wix-import/converters/rich-text'
import { importMediaBatch, importMediaByUrl } from '@/endpoints/wix-import/importers/media'

function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function getPageTitle(page: WixSitePage): string {
  return page.title || page.pageTitle || page.slug || page.path || `page-${page.id}`
}

function getPageSlug(page: WixSitePage): string {
  const base = page.slug || page.path || page.title || page.pageTitle || page.id
  return toKebabCase(base.replace(/^\//, '').replace(/\/$/, ''))
}

export async function importPages(
  payload: Payload,
  wixPages: WixSitePage[],
  options?: {
    skipExisting?: boolean
    upsertByWixId?: boolean
    dryRun?: boolean
    publishOnImport?: boolean
    idMap?: ImportIdMap
    mediaResult?: ImportEntityResult
  },
): Promise<ImportEntityResult> {
  const result: ImportEntityResult = { created: 0, updated: 0, skipped: 0, errors: [] }
  const idMap = options?.idMap ?? {
    categories: new Map(),
    media: new Map(),
    posts: new Map(),
    pages: new Map(),
  }

  const allImageUrls: string[] = []
  for (const page of wixPages) {
    if (page.richContent) {
      allImageUrls.push(...extractImagesFromRichContent(page.richContent))
    }
    if (page.coverImage?.url) allImageUrls.push(page.coverImage.url)
    if (page.heroImage?.url) allImageUrls.push(page.heroImage.url)
  }

  if (allImageUrls.length > 0) {
    payload.logger.info(`  Pre-downloading ${allImageUrls.length} images from pages...`)
    const mediaBatchResult = await importMediaBatch(payload, allImageUrls, {
      skipExisting: options?.skipExisting,
      dryRun: options?.dryRun,
      idMap,
      concurrency: 5,
    })
    if (options?.mediaResult) {
      mergeEntityResult(options.mediaResult, mediaBatchResult)
    }
  }

  for (const page of wixPages) {
    try {
      const title = getPageTitle(page)
      const slug = getPageSlug(page)

      let existingByWixId: { docs?: Array<{ id: number | string }> } | null = null
      if (options?.upsertByWixId) {
        existingByWixId = await payload.find({
          collection: 'pages',
          where: { sourceId: { equals: page.id } },
          limit: 1,
          depth: 0,
        })
      }

      const existingBySlug = await payload.find({
        collection: 'pages',
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 0,
      })
      const existingDoc = existingByWixId?.docs?.[0] || existingBySlug.docs[0]

      if (existingDoc && !options?.upsertByWixId && options?.skipExisting) {
        idMap.pages.set(page.id, existingDoc.id)
        result.skipped++
        payload.logger.info(`  Skipping existing page: ${title}`)
        continue
      }

      const richText = page.richContent
        ? wixRichContentToLexical(page.richContent, {
            resolveMediaId: (url) => idMap.media.get(url) ?? null,
            onUnresolvedMedia: (url) => {
              payload.logger.warn(`  Unresolved page inline media URL: ${url}`)
            },
          })
        : plainTextToLexical(page.plainContent || '')

      let heroMediaId: number | string | null = null
      const coverUrl = page.coverImage?.url || page.heroImage?.url
      if (coverUrl) {
        const resolved = resolveWixImageUrl(coverUrl)
        heroMediaId = idMap.media.get(resolved) ?? null

        if (!heroMediaId) {
          heroMediaId = await importMediaByUrl(payload, coverUrl, {
            alt: title,
            skipExisting: options?.skipExisting,
            dryRun: options?.dryRun,
            idMap,
          })
        }
      }

      const pageData: Record<string, unknown> = {
        title,
        slug,
        sourceId: page.id,
        sourceUpdatedAt: page.updatedDate || page.publishedDate || null,
        hero: {
          type: heroMediaId ? 'mediumImpact' : 'none',
          media: heroMediaId || undefined,
          richText: plainTextToLexical(''),
        },
        layout: [
          {
            blockType: 'content',
            columns: [
              {
                size: 'full',
                richText,
                enableLink: false,
              },
            ],
          },
        ],
        publishedAt: page.firstPublishedDate || page.publishedDate || new Date().toISOString(),
      }

      if (page.seoData?.tags?.length) {
        const seoMeta: { title?: string; description?: string } = {}
        for (const tag of page.seoData.tags) {
          if (tag.type === 'title' && tag.children) seoMeta.title = tag.children
          if (tag.type === 'meta' && tag.props?.name === 'description' && tag.props?.content) {
            seoMeta.description = tag.props.content
          }
        }
        pageData.meta = {
          title: seoMeta.title || title,
          description: seoMeta.description,
        }
      }

      if (existingDoc && options?.upsertByWixId) {
        if (!options?.dryRun) {
          await payload.update({
            collection: 'pages',
            id: existingDoc.id,
            draft: !options?.publishOnImport,
            data: {
              ...pageData,
              _status: options?.publishOnImport ? 'published' : 'draft',
            },
            depth: 0,
            context: { disableRevalidate: true },
          } as unknown as Parameters<typeof payload.update>[0])
        }
        idMap.pages.set(page.id, existingDoc.id)
        result.updated++
        payload.logger.info(`  Updated page: ${title}`)
      } else {
        const doc = options?.dryRun
          ? { id: `dry-run:${page.id}` }
          : await payload.create({
              collection: 'pages',
              draft: !options?.publishOnImport,
              data: {
                ...pageData,
                _status: options?.publishOnImport ? 'published' : 'draft',
              },
              depth: 0,
              context: { disableRevalidate: true },
            } as unknown as Parameters<typeof payload.create>[0])

        idMap.pages.set(page.id, doc.id)
        result.created++
        payload.logger.info(`  Created page: ${title}`)
      }
    } catch (error) {
      const msg = `Failed to import page "${getPageTitle(page)}": ${error}`
      result.errors.push(msg)
      payload.logger.error(msg)
    }
  }

  return result
}

function mergeEntityResult(target: ImportEntityResult, source: ImportEntityResult): void {
  target.created += source.created
  target.updated += source.updated
  target.skipped += source.skipped
  target.errors.push(...source.errors)
}
