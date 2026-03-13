import type { Metadata } from 'next'

import type { Media, Page, Post, Config } from '@/payload-types'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { getServerSideURL } from '@/utilities/getURL'
import { ogImagePathForRoute } from '@/utilities/ogImage'

const getImageURL = (
  path: string,
  image?: Media | Config['db']['defaultIDType'] | null,
) => {
  const serverUrl = getServerSideURL()
  const toAbsolute = (value: string): string =>
    value.startsWith('http://') || value.startsWith('https://') ? value : `${serverUrl}${value}`

  const resolveSupabasePublicMediaUrl = (filename: string): string | null => {
    if (!filename) return null
    const endpoint = process.env.S3_ENDPOINT
    const bucket = process.env.S3_BUCKET
    if (!endpoint || !bucket) return null

    try {
      const endpointUrl = new URL(endpoint)
      const baseOrigin = endpointUrl.origin
      const encodedFilename = filename
        .split('/')
        .map((segment) => encodeURIComponent(segment))
        .join('/')
      return `${baseOrigin}/storage/v1/object/public/${bucket}/${encodedFilename}`
    } catch {
      return null
    }
  }

  const normalizeMediaUrl = (value: string, fallbackFilename?: string | null): string => {
    if (!value) return ''
    if (value.startsWith('/api/media/file/')) {
      const urlFilename = value.replace('/api/media/file/', '').split('?')[0]?.split('#')[0]?.trim() || ''
      const fromFallback = fallbackFilename || ''
      const filename = fromFallback || urlFilename
      const supabaseUrl = filename ? resolveSupabasePublicMediaUrl(filename) : null
      return supabaseUrl || toAbsolute(value)
    }
    return toAbsolute(value)
  }

  let url = toAbsolute(ogImagePathForRoute(path))

  if (image && typeof image === 'object' && 'url' in image) {
    const ogFilename = image.sizes?.og?.filename || null
    const ogUrl = image.sizes?.og?.url

    if (ogFilename) {
      const resolved = resolveSupabasePublicMediaUrl(ogFilename)
      if (resolved) {
        url = resolved
      } else if (ogUrl) {
        url = normalizeMediaUrl(ogUrl, ogFilename)
      }
    } else if (ogUrl) {
      url = normalizeMediaUrl(ogUrl, ogFilename)
    } else if (image.filename) {
      const resolved = resolveSupabasePublicMediaUrl(image.filename)
      if (resolved) {
        url = resolved
      } else if (image.url) {
        url = normalizeMediaUrl(image.url, image.filename)
      }
    } else if (image.url) {
      url = normalizeMediaUrl(image.url)
    }
  }

  return url
}

const getDocPath = (
  doc: Partial<Page> | Partial<Post> | null,
  postPathPrefix: string = '/posts',
): string => {
  if (!doc || typeof doc.slug !== 'string') return '/'

  if ('layout' in doc) {
    return doc.slug === 'home' ? '/' : `/${doc.slug}`
  }

  if ('content' in doc) {
    return `${postPathPrefix}/${doc.slug}`
  }

  return '/'
}

type StaticFallbackMetadata = {
  description?: string
  openGraph?: Metadata['openGraph']
  title?: string
}

export const generateStaticFallbackMeta = (
  path: string,
  fallback: StaticFallbackMetadata,
): Metadata => {
  const serverUrl = getServerSideURL()
  const canonicalPath = path.startsWith('/') ? path : `/${path}`
  const title = fallback.title || 'IMP Global Megatrend Umbrella Fund'
  const description = fallback.description || ''
  const generatedImage = `${serverUrl}${ogImagePathForRoute(canonicalPath)}`
  const resolvedTwitterImage = generatedImage
  const twitterImages = resolvedTwitterImage ? [resolvedTwitterImage] : undefined

  return {
    alternates: {
      canonical: canonicalPath,
    },
    description: fallback.description,
    openGraph: mergeOpenGraph({
      ...fallback.openGraph,
      description,
      images: [{ url: generatedImage }],
      title,
      url: `${serverUrl}${canonicalPath}`,
    }),
    title,
    twitter: {
      card: 'summary_large_image',
      description,
      images: twitterImages,
      title,
    },
  }
}

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | null
  postPathPrefix?: string
}): Promise<Metadata> => {
  const { doc, postPathPrefix } = args

  const serverUrl = getServerSideURL()
  const path = getDocPath(doc, postPathPrefix)
  const ogImage = getImageURL(path, doc?.meta?.image)

  const title = doc?.meta?.title || 'IMP Global Megatrend Umbrella Fund'
  const description = doc?.meta?.description || ''

  return {
    alternates: {
      canonical: path,
    },
    description: doc?.meta?.description,
    openGraph: mergeOpenGraph({
      description,
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title,
      url: `${serverUrl}${path}`,
    }),
    title,
    twitter: {
      card: 'summary_large_image',
      description,
      images: ogImage ? [ogImage] : undefined,
      title,
    },
  }
}
