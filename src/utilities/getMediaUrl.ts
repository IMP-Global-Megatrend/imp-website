/**
 * Processes media resource URL to ensure proper formatting
 * @param url The original URL from the resource
 * @param cacheTag Optional cache tag to append to the URL
 * @returns Properly formatted URL with cache tag if provided
 */
export const getMediaUrl = (url: string | null | undefined, cacheTag?: string | null): string => {
  if (!url) return ''

  // Next.js local image patterns can reject query strings for local routes.
  // Keep local media URLs stable and query-free.
  if (url.startsWith('/')) return url

  if (cacheTag && cacheTag !== '') {
    cacheTag = encodeURIComponent(cacheTag)
  }

  if (!cacheTag) return url
  return `${url}${url.includes('?') ? '&' : '?'}${cacheTag}`
}
