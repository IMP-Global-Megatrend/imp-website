/**
 * Decode percent-encoding on stored object keys until stable so we never apply
 * encodeURIComponent on top of literal `%20` (Supabase then sees `%2520` and returns InvalidKey).
 */
export function normalizeFilenameForSupabaseObjectKey(key: string): string {
  let current = key.trim()
  if (!current) return ''

  for (let i = 0; i < 8; i++) {
    if (!/%[0-9A-Fa-f]{2}/.test(current)) break
    try {
      const decoded = decodeURIComponent(current)
      if (decoded === current) break
      current = decoded
    } catch {
      break
    }
  }

  return current
}

export function resolveSupabasePublicMediaUrl(filename: string): string | null {
  if (!filename) return null

  const endpoint = process.env.S3_ENDPOINT
  const bucket = process.env.S3_BUCKET
  if (!endpoint || !bucket) return null

  try {
    const endpointUrl = new URL(endpoint)
    const baseOrigin = endpointUrl.origin
    const encodedFilename = normalizeFilenameForSupabaseObjectKey(filename)
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/')

    return `${baseOrigin}/storage/v1/object/public/${bucket}/${encodedFilename}`
  } catch {
    return null
  }
}

const PUBLIC_STORAGE_MARKER = '/storage/v1/object/public/'

/**
 * Fix an existing public object URL whose path was double-encoded (e.g. `%2520`).
 */
export function normalizeSupabasePublicObjectUrl(url: string): string {
  if (!url.includes(PUBLIC_STORAGE_MARKER)) return url

  const bucket = process.env.S3_BUCKET
  if (!bucket) return url

  const prefix = `${PUBLIC_STORAGE_MARKER}${bucket}/`

  try {
    const u = new URL(url)
    const pos = u.pathname.indexOf(prefix)
    if (pos === -1) return url

    const encodedKey = u.pathname.slice(pos + prefix.length)
    if (!encodedKey) return url

    const normalizedKey = normalizeFilenameForSupabaseObjectKey(encodedKey)
    const reencoded = normalizedKey.split('/').map((segment) => encodeURIComponent(segment)).join('/')

    const newPath = `${u.pathname.slice(0, pos + prefix.length)}${reencoded}`
    return `${u.origin}${newPath}${u.search}${u.hash}`
  } catch {
    return url
  }
}
