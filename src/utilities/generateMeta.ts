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

  let url = toAbsolute(ogImagePathForRoute(path))

  if (image && typeof image === 'object' && 'url' in image) {
    const ogUrl = image.sizes?.og?.url

    if (ogUrl) {
      url = toAbsolute(ogUrl)
    } else if (image.url) {
      url = toAbsolute(image.url)
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
