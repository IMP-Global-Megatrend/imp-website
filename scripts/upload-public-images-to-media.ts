// @ts-nocheck
import path from 'node:path'
import { readdir, readFile } from 'node:fs/promises'
import config from '@payload-config'
import { getPayload } from 'payload'

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.avif', '.ico'])

function filenameToAlt(filename: string): string {
  const withoutExt = filename.replace(/\.[a-zA-Z0-9]+$/, '')
  const normalized = withoutExt
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return normalized || 'Image'
}

function mimeTypeFromFilename(filename: string): string {
  const ext = path.extname(filename).toLowerCase()
  switch (ext) {
    case '.png':
      return 'image/png'
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.webp':
      return 'image/webp'
    case '.svg':
      return 'image/svg+xml'
    case '.gif':
      return 'image/gif'
    case '.avif':
      return 'image/avif'
    case '.ico':
      return 'image/x-icon'
    default:
      return 'application/octet-stream'
  }
}

async function collectImageFiles(
  directory: string,
  relativeBase = '',
): Promise<Array<{ relativePath: string; absolutePath: string }>> {
  const entries = await readdir(directory, { withFileTypes: true })
  const files: Array<{ relativePath: string; absolutePath: string }> = []

  for (const entry of entries) {
    const relativePath = relativeBase ? `${relativeBase}/${entry.name}` : entry.name
    const absolutePath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      files.push(...(await collectImageFiles(absolutePath, relativePath)))
      continue
    }

    const ext = path.extname(entry.name).toLowerCase()
    if (!IMAGE_EXTENSIONS.has(ext)) continue
    files.push({ relativePath, absolutePath })
  }

  return files
}

async function main() {
  console.log('upload-public-images-to-media:start')
  const payload = await getPayload({ config })
  const created: string[] = []
  const existing: string[] = []
  const failed: Array<{ file: string; error: string }> = []

  const imagesRoot = path.resolve(process.cwd(), 'public/images')
  const imageFiles = (await collectImageFiles(imagesRoot)).sort((a, b) =>
    a.relativePath.localeCompare(b.relativePath),
  )
  console.log(`upload-public-images-to-media:found ${imageFiles.length} files`)

  for (const file of imageFiles) {
    try {
      const filename = path.basename(file.relativePath)
      const sourceUrl = `/images/${file.relativePath}`

      const bySourceOrFilename = await payload.find({
        collection: 'media',
        where: {
          or: [{ sourceUrl: { equals: sourceUrl } }, { filename: { equals: filename } }],
        },
        limit: 1,
        pagination: false,
        depth: 0,
      })

      if ((bySourceOrFilename.docs?.length ?? 0) > 0) {
        existing.push(file.relativePath)
        continue
      }

      const data = await readFile(file.absolutePath)
      await payload.create({
        collection: 'media',
        data: {
          alt: filenameToAlt(filename),
          sourceUrl,
        },
        file: {
          name: filename,
          data,
          mimetype: mimeTypeFromFilename(filename),
          size: data.byteLength,
        },
      })

      created.push(file.relativePath)
    } catch (error) {
      failed.push({ file: file.relativePath, error: String(error) })
    }
  }

  const summary = {
    total: imageFiles.length,
    created,
    existing,
    failed,
  }
  console.log('upload-public-images-to-media:done')
  payload.logger.info({ summary }, 'Public image upload completed')
  console.log(JSON.stringify(summary, null, 2))
}

try {
  await main()
} catch (error) {
  console.error(error)
  process.exit(1)
}
