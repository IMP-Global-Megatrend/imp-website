// @ts-nocheck
import dotenv from 'dotenv'
import path from 'node:path'
import { readFile } from 'node:fs/promises'
import { getPayload, type File } from 'payload'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const OG_PAGE_MAPPINGS: Array<{ filename: string; slug: string; alt: string }> = [
  { filename: 'home-hero-og.png', slug: 'home', alt: 'Home page Open Graph image' },
  { filename: 'fund-og.png', slug: 'fund', alt: 'Fund page Open Graph image' },
  { filename: 'megatrends-og.png', slug: 'megatrends', alt: 'Megatrends page Open Graph image' },
  { filename: 'portfolio-strategy-og.png', slug: 'portfolio-strategy', alt: 'Portfolio Strategy page Open Graph image' },
  { filename: 'performance-analysis-og.png', slug: 'performance-analysis', alt: 'Performance Analysis page Open Graph image' },
  { filename: 'about-us-og.png', slug: 'about-us', alt: 'About Us page Open Graph image' },
  { filename: 'contact-us-og.png', slug: 'contact-us', alt: 'Contact Us page Open Graph image' },
  {
    filename: 'newsletter-subscription-og.png',
    slug: 'newsletter-subscription',
    alt: 'Newsletter Subscription page Open Graph image',
  },
  { filename: 'privacy-policy-og.png', slug: 'privacy-policy', alt: 'Privacy Policy page Open Graph image' },
  { filename: 'legal-information-og.png', slug: 'legal-information', alt: 'Legal Information page Open Graph image' },
  { filename: 'posts-og.png', slug: 'posts', alt: 'Posts page Open Graph image' },
  { filename: 'search-og.png', slug: 'search', alt: 'Search page Open Graph image' },
]

const OG_DIR = path.resolve('public/images/og')

function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join(' ')
}

function buildOgSourceUrl(filename: string): string {
  return `/images/og/${filename}`
}

async function toPayloadFile(filename: string): Promise<File> {
  const absolutePath = path.join(OG_DIR, filename)
  const data = await readFile(absolutePath)
  return {
    name: filename,
    data,
    mimetype: 'image/png',
    size: data.byteLength,
  }
}

async function upsertOgMedia(payload: Awaited<ReturnType<typeof getPayload>>, item: (typeof OG_PAGE_MAPPINGS)[number]) {
  const sourceUrl = buildOgSourceUrl(item.filename)
  const existing = await payload.find({
    collection: 'media',
    where: { sourceUrl: { equals: sourceUrl } },
    limit: 1,
    pagination: false,
    depth: 0,
  })

  const existingDoc = existing.docs?.[0]
  if (existingDoc) {
    await payload.update({
      collection: 'media',
      id: existingDoc.id,
      data: {
        alt: item.alt,
        sourceUrl,
      },
      depth: 0,
    })
    return existingDoc.id
  }

  const file = await toPayloadFile(item.filename)
  const created = await payload.create({
    collection: 'media',
    data: {
      alt: item.alt,
      sourceUrl,
    },
    file,
    depth: 0,
  })

  return created.id
}

async function linkOgToPage(payload: Awaited<ReturnType<typeof getPayload>>, slug: string, mediaId: number) {
  const pageResult = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    limit: 1,
    pagination: false,
    depth: 0,
  })

  const page = pageResult.docs?.[0]
  let pageToUpdate = page

  if (!pageToUpdate) {
    pageToUpdate = await payload.create({
      collection: 'pages',
      data: {
        title: slugToTitle(slug),
        slug,
        layout: [
          {
            blockType: 'content',
            columns: [],
          },
        ],
      },
      depth: 0,
      context: {
        disableRevalidate: true,
      },
    })
  }

  await payload.update({
    collection: 'pages',
    id: pageToUpdate.id,
    data: {
      meta: {
        ...(pageToUpdate.meta || {}),
        image: mediaId,
      },
    },
    depth: 0,
    context: {
      disableRevalidate: true,
    },
  })

  return true
}

async function main() {
  const { default: config } = await import('@payload-config')
  const payload = await getPayload({ config })

  let linkedCount = 0
  const missingSlugs: string[] = []

  for (const item of OG_PAGE_MAPPINGS) {
    const mediaId = await upsertOgMedia(payload, item)
    const linked = await linkOgToPage(payload, item.slug, mediaId)

    if (linked) {
      linkedCount += 1
      payload.logger.info(`[og-images] linked ${item.filename} -> page "${item.slug}" (media #${mediaId})`)
    } else {
      missingSlugs.push(item.slug)
      payload.logger.warn(`[og-images] page "${item.slug}" not found; uploaded media #${mediaId} only`)
    }
  }

  payload.logger.info(`[og-images] linked ${linkedCount}/${OG_PAGE_MAPPINGS.length} page records`)
  if (missingSlugs.length > 0) {
    payload.logger.warn(`[og-images] missing page slugs: ${missingSlugs.join(', ')}`)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
