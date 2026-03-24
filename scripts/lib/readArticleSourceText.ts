/**
 * Read article body text from .docx, .rtf, or macOS .rtfd (bundle with TXT.rtf).
 */
import fs from 'node:fs/promises'
import path from 'node:path'

import mammoth from 'mammoth'
import rtfParse from 'rtf-parser'

export function normalizeArticleWhitespace(value: string): string {
  return value
    .replace(/\r\n/g, '\n')
    .replace(/\u0000/g, '')
    .replace(/\u200b/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** Drop macOS TextEdit / RTF graphic placeholder paragraphs. */
export function stripRtfGraphicPlaceholders(text: string): string {
  return text
    .split('\n\n')
    .map((b) => b.trim())
    .filter((b) => {
      if (!b) return false
      if (/^pastedGraphic\.png/i.test(b)) return false
      if (/^1__#\$!@%!#__pastedGraphic\.png/i.test(b)) return false
      if (b.replace(/\s+/g, '') === '') return false
      // lone replacement / control noise from NeXTGraphic
      if (b.length <= 3 && /[\ufffd\u0002-\u0008]/.test(b)) return false
      return true
    })
    .join('\n\n')
}

type RtfDoc = {
  content?: Array<{ content?: Array<{ value?: string }> }>
}

function rtfDocumentToPlain(doc: RtfDoc): string {
  const blocks: string[] = []
  for (const para of doc.content || []) {
    let s = ''
    for (const span of para.content || []) {
      if (span?.value) s += span.value
    }
    s = s.replace(/\u00a0/g, ' ').trim()
    blocks.push(s)
  }
  return blocks.filter((b) => b.length > 0).join('\n\n')
}

function parseRtfString(rtf: string): Promise<RtfDoc> {
  return new Promise((resolve, reject) => {
    rtfParse.string(rtf, (err, doc) => {
      if (err) reject(err)
      else resolve(doc as RtfDoc)
    })
  })
}

/** Resolve to a concrete file: .docx, .rtf, or TXT.rtf inside .rtfd */
export async function resolveArticleSourcePath(inputPath: string): Promise<string> {
  const resolved = path.resolve(inputPath)
  const stat = await fs.stat(resolved).catch(() => null)
  if (!stat) {
    throw new Error(`Path not found: ${resolved}`)
  }

  if (stat.isDirectory() || resolved.toLowerCase().endsWith('.rtfd')) {
    const txtRtf = path.join(resolved, 'TXT.rtf')
    try {
      await fs.access(txtRtf)
      return txtRtf
    } catch {
      const names = await fs.readdir(resolved)
      const rtfs = names.filter((f) => f.toLowerCase().endsWith('.rtf')).sort()
      if (!rtfs.length) {
        throw new Error(`No .rtf file found in bundle: ${resolved}`)
      }
      return path.join(resolved, rtfs[0])
    }
  }

  const ext = path.extname(resolved).toLowerCase()
  if (ext === '.rtf' || ext === '.docx') {
    return resolved
  }

  throw new Error(`Unsupported source type: ${resolved} (use .docx, .rtf, or .rtfd directory)`)
}

/** Plain text suitable for plainTextToLexical (paragraphs separated by blank lines). */
export async function readArticleSourcePlainText(inputPath: string): Promise<string> {
  const filePath = await resolveArticleSourcePath(inputPath)
  const ext = path.extname(filePath).toLowerCase()

  if (ext === '.docx') {
    const result = await mammoth.extractRawText({ path: filePath })
    return normalizeArticleWhitespace(result.value || '')
  }

  if (ext === '.rtf') {
    const rtf = await fs.readFile(filePath, 'utf8')
    const doc = await parseRtfString(rtf)
    const raw = rtfDocumentToPlain(doc)
    return normalizeArticleWhitespace(stripRtfGraphicPlaceholders(raw))
  }

  throw new Error(`Unsupported extension: ${ext}`)
}
