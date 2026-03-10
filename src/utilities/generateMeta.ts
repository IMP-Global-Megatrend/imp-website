import type { Metadata } from 'next'

import type { Media, Page, Post, Config } from '../payload-types'

import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'

const pageOgImageBySlug: Record<string, string> = {
  home: '/images/og/home-hero-og.png',
  fund: '/images/og/fund-og.png',
  megatrends: '/images/og/megatrends-og.png',
  'portfolio-strategy': '/images/og/portfolio-strategy-og.png',
  'performance-analysis': '/images/og/performance-analysis-og.png',
  'about-us': '/images/og/about-us-og.png',
  'contact-us': '/images/og/contact-us-og.png',
  'newsletter-subscription': '/images/og/newsletter-subscription-og.png',
  'privacy-policy': '/images/og/privacy-policy-og.png',
  'legal-information': '/images/og/legal-information-og.png',
  search: '/images/og/search-og.png',
}

const postsFallbackOgImage = '/images/og/posts-og.png'

const resolveDefaultImagePath = (doc: Partial<Page> | Partial<Post> | null): string => {
  if (!doc) return '/images/og/home-hero-og.png'

  if ('layout' in doc) {
    const slug = typeof doc.slug === 'string' ? doc.slug : ''
    return pageOgImageBySlug[slug] || '/images/og/home-hero-og.png'
  }

  if ('content' in doc) {
    return postsFallbackOgImage
  }

  return '/images/og/home-hero-og.png'
}

const getImageURL = (
  doc: Partial<Page> | Partial<Post> | null,
  image?: Media | Config['db']['defaultIDType'] | null,
) => {
  const serverUrl = getServerSideURL()
  const toAbsolute = (value: string): string =>
    value.startsWith('http://') || value.startsWith('https://') ? value : `${serverUrl}${value}`

  let url = toAbsolute(resolveDefaultImagePath(doc))

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
  const openGraphImages = fallback.openGraph?.images
  const firstOpenGraphImage = Array.isArray(openGraphImages) ? openGraphImages[0] : openGraphImages
  const resolvedTwitterImage =
    typeof firstOpenGraphImage === 'string' || firstOpenGraphImage instanceof URL
      ? firstOpenGraphImage
      : firstOpenGraphImage?.url
  const twitterImages = resolvedTwitterImage ? [resolvedTwitterImage] : undefined

  return {
    alternates: {
      canonical: canonicalPath,
    },
    description: fallback.description,
    openGraph: mergeOpenGraph({
      ...fallback.openGraph,
      description,
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
  const ogImage = getImageURL(doc, doc?.meta?.image)

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
