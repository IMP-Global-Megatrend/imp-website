import { resolveSupabasePublicMediaUrl } from '@/utilities/resolveSupabasePublicMediaUrl'

/** Payload serves uploads at `/api/media/file/<filename>` (filename may contain `/`). */
export function buildPayloadMediaFileHrefFromFilename(filename: string): string {
  const t = filename.trim()
  if (!t) return ''
  return `/api/media/file/${t.split('/').map((seg) => encodeURIComponent(seg)).join('/')}`
}

/**
 * Prefer a direct Supabase public URL when env is configured; otherwise keep the Payload
 * proxy path so links still work (critical when `media.url` is absolute `http(s)://…/api/media/...`).
 */
export function resolveApiMediaFileOrSupabasePath(pathFromRoot: string): string {
  if (!pathFromRoot.startsWith('/api/media/file/')) return ''

  const raw =
    pathFromRoot.replace(/^\/api\/media\/file\//, '').split('?')[0]?.split('#')[0]?.trim() ?? ''
  if (!raw) return pathFromRoot

  let decoded = raw
  try {
    decoded = decodeURIComponent(raw.replace(/\+/g, '%20'))
  } catch {
    decoded = raw
  }

  return resolveSupabasePublicMediaUrl(decoded) || pathFromRoot
}
