// @ts-nocheck
import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import dotenv from 'dotenv'
import { chromium } from 'playwright'
import sharp from 'sharp'
import { getPayload } from 'payload'
import articlesContent from '../src/constants/articles-content.json'
import fallbacks from '../src/constants/fallbacks.json'
import postsContent from '../src/constants/posts-content.json'
import searchContent from '../src/constants/search-content.json'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
if (!process.env.PAYLOAD_SECRET) {
  process.env.PAYLOAD_SECRET = 'local-og-generation-secret'
}

const WIDTH = 1200
const HEIGHT = 630
const OUTPUT_DIR = path.resolve('public/images/og/generated')
const PREVIEW_PATH = '/og/preview'
const BASE_URL = (process.env.OG_CAPTURE_BASE_URL || process.env.NEXT_PUBLIC_SERVER_URL || 'http://127.0.0.1:3000').replace(
  /\/$/,
  '',
)
const CMS_PAGE_LIMIT = 1000
const CMS_POST_LIMIT = 2000
const CMS_CATEGORY_LIMIT = 400
const MAX_OG_BYTES = Number(process.env.OG_MAX_BYTES || 300 * 1024)
const OG_EXTENSION = 'jpg'

const pagePaletteBySlug = {
  home: { color1: '#2b3dea', color2: '#4153ff', color3: '#2634cb' },
  fund: { color1: '#2b3dea', color2: 'oklch(0.45 0.12 58)', color3: 'oklch(0.45 0.11 20)' },
  megatrends: { color1: '#2b3dea', color2: 'oklch(0.47 0.12 174)', color3: 'oklch(0.47 0.10 136)' },
  'portfolio-strategy': { color1: '#2b3dea', color2: 'oklch(0.46 0.16 24)', color3: 'oklch(0.46 0.12 62)' },
  'performance-analysis': { color1: '#2b3dea', color2: 'oklch(0.46 0.14 330)', color3: 'oklch(0.46 0.12 280)' },
  'about-us': { color1: '#2b3dea', color2: 'oklch(0.47 0.11 128)', color3: 'oklch(0.47 0.10 176)' },
  'contact-us': { color1: '#2b3dea', color2: 'oklch(0.47 0.11 128)', color3: 'oklch(0.47 0.10 176)' },
  'newsletter-subscription': { color1: '#2b3dea', color2: 'oklch(0.46 0.13 18)', color3: 'oklch(0.46 0.11 322)' },
  'privacy-policy': { color1: '#334155', color2: '#1d4ed8', color3: '#1e3a8a' },
  'legal-information': { color1: '#0f172a', color2: '#2563eb', color3: '#334155' },
}

function log(message) {
  // eslint-disable-next-line no-console
  console.log(message)
}

function ensureString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeUrl(url) {
  if (!url) return ''
  return url.startsWith('http://') || url.startsWith('https://') ? url : `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

function parseRichTextParagraphs(richText) {
  const root = richText && typeof richText === 'object' ? richText.root : null
  const children = Array.isArray(root?.children) ? root.children : []

  return children
    .map((node) => {
      const textChildren = Array.isArray(node?.children) ? node.children : []
      return textChildren
        .filter((child) => child?.type === 'text' && typeof child?.text === 'string')
        .map((child) => child.text)
        .join('')
        .replace(/\s+/g, ' ')
        .trim()
    })
    .filter(Boolean)
}

function resolveMediaUrl(media) {
  if (!media || typeof media !== 'object') return ''

  if (media?.sizes?.og?.url && typeof media.sizes.og.url === 'string') {
    return media.sizes.og.url
  }

  if (typeof media.url === 'string' && media.url.trim()) {
    return media.url.trim()
  }

  return ''
}

function pageHeroCopy(page) {
  const slug = ensureString(page?.slug)
  const title = ensureString(page?.title)
  const paragraphLines = parseRichTextParagraphs(page?.hero?.richText)
  const richTextTitle = paragraphLines[0] || ''
  const richTextSubtitle = paragraphLines[1] || ''

  if (slug === 'about-us') {
    return { title: ensureString(page?.aboutUsHeroTitle) || title || richTextTitle, subtitle: '' }
  }

  if (slug === 'megatrends') {
    return {
      title: ensureString(page?.megatrendsHeroTitle) || title || richTextTitle,
      subtitle: ensureString(page?.megatrendsHeroSubtitle) || richTextSubtitle,
    }
  }

  if (slug === 'portfolio-strategy') {
    return {
      title: ensureString(page?.portfolioStrategyHeroTitle) || title || richTextTitle,
      subtitle: ensureString(page?.portfolioStrategyHeroSubtitle) || richTextSubtitle,
    }
  }

  if (slug === 'performance-analysis') {
    const usdLabel = ensureString(page?.performanceUsdLabel)
    const chfLabel = ensureString(page?.performanceChfLabel)
    const subtitle = usdLabel && chfLabel ? `${usdLabel} & ${chfLabel}` : richTextSubtitle
    return {
      title: ensureString(page?.performanceHeroTitle) || title || richTextTitle,
      subtitle,
    }
  }

  if (slug === 'contact-us') {
    return { title: title || richTextTitle || 'Contact Us', subtitle: '' }
  }

  if (slug === 'newsletter-subscription') {
    return {
      title: title || richTextTitle || 'Newsletter Subscription',
      subtitle: ensureString(page?.newsletterIntroBody) || richTextSubtitle,
    }
  }

  if (slug === 'home') {
    return {
      title: richTextTitle || ensureString(fallbacks.home.hero.heading),
      subtitle: richTextSubtitle || ensureString(fallbacks.home.hero.subtitle),
    }
  }

  return { title: title || richTextTitle || slug || 'IMP Global Megatrend', subtitle: richTextSubtitle }
}

function buildPreviewUrl(descriptor) {
  const url = new URL(`${BASE_URL}${PREVIEW_PATH}`)
  url.searchParams.set('title', descriptor.title)
  if (descriptor.palette?.color1 && descriptor.palette?.color2 && descriptor.palette?.color3) {
    url.searchParams.set('color1', descriptor.palette.color1)
    url.searchParams.set('color2', descriptor.palette.color2)
    url.searchParams.set('color3', descriptor.palette.color3)
  }
  return url.toString()
}

function toOutputPath(relativePath) {
  const safeRelative = relativePath.replace(/^\/+/, '')
  return path.join(OUTPUT_DIR, safeRelative)
}

async function captureDescriptor(page, descriptor) {
  const outputPath = toOutputPath(descriptor.relativePath)
  const directory = path.dirname(outputPath)
  await mkdir(directory, { recursive: true })

  await page.goto(buildPreviewUrl(descriptor), {
    waitUntil: 'networkidle',
    timeout: 45000,
  })
  await page.evaluate(() => {
    const removableSelectors = [
      'nextjs-portal',
      '[data-nextjs-toast]',
      '[data-nextjs-dev-tools-button]',
      '[data-nextjs-dev-tools]',
      '[id^="nextjs-"]',
    ]

    for (const selector of removableSelectors) {
      for (const node of document.querySelectorAll(selector)) {
        if (node instanceof HTMLElement) node.style.display = 'none'
      }
    }

    for (const node of Array.from(document.querySelectorAll('*'))) {
      if (!(node instanceof HTMLElement)) continue
      const style = window.getComputedStyle(node)
      if (style.position !== 'fixed') continue
      const zIndex = Number(style.zIndex || '0')
      const pinnedBottom = style.bottom !== 'auto'
      if (zIndex >= 1000 || pinnedBottom) {
        node.style.display = 'none'
      }
    }
  })
  await page.waitForTimeout(1100)
  const screenshotBuffer = await page.screenshot({
    type: 'png',
  })
  const optimizedBuffer = await optimizeForShareTargets(screenshotBuffer)
  await writeFile(outputPath, optimizedBuffer)
}

async function optimizeForShareTargets(screenshotBuffer) {
  const candidates = []
  const scales = [1, 0.95, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65]
  const qualities = [86, 78, 70, 62, 54, 46, 40, 34, 28, 24]

  for (const scale of scales) {
    const width = Math.max(640, Math.round(WIDTH * scale))
    const height = Math.max(336, Math.round(HEIGHT * scale))
    for (const quality of qualities) {
      const candidate = await sharp(screenshotBuffer)
        .resize({
          width,
          height,
          fit: 'fill',
        })
        .jpeg({
          quality,
          mozjpeg: true,
          chromaSubsampling: '4:2:0',
        })
        .toBuffer()
      candidates.push(candidate)
      if (candidate.byteLength <= MAX_OG_BYTES) return candidate
    }
  }

  return candidates.sort((a, b) => a.byteLength - b.byteLength)[0]
}

async function buildDescriptors(payload) {
  const descriptors = []
  const pageSlugs = new Set()

  const pageResult = await payload.find({
    collection: 'pages',
    limit: CMS_PAGE_LIMIT,
    pagination: false,
    depth: 2,
    draft: false,
    overrideAccess: false,
  })

  for (const page of pageResult.docs || []) {
    const slug = ensureString(page?.slug)
    if (!slug) continue
    pageSlugs.add(slug)
    const hero = pageHeroCopy(page)
    const backgroundFromHero = resolveMediaUrl(page?.hero?.media)
    const backgroundFromMeta = resolveMediaUrl(page?.meta?.image)

    descriptors.push({
      relativePath: `pages/${slug}.${OG_EXTENSION}`,
      title: hero.title || ensureString(page?.title) || slug,
      subtitle: hero.subtitle || '',
      palette: pagePaletteBySlug[slug] || pagePaletteBySlug.home,
    })
  }

  if (!pageSlugs.has('home')) {
    descriptors.push({
      relativePath: `pages/home.${OG_EXTENSION}`,
      title: ensureString(fallbacks?.metadata?.home?.title) || 'IMP Global Megatrend Umbrella Fund',
      subtitle: '',
      palette: pagePaletteBySlug.home,
    })
  }

  if (!pageSlugs.has('performance-analysis')) {
    descriptors.push({
      relativePath: `pages/performance-analysis.${OG_EXTENSION}`,
      title: ensureString(fallbacks?.metadata?.performanceAnalysis?.title) || 'Performance Analysis',
      subtitle: '',
      palette: pagePaletteBySlug['performance-analysis'] || pagePaletteBySlug.home,
    })
  }

  const postResult = await payload.find({
    collection: 'posts',
    limit: CMS_POST_LIMIT,
    pagination: false,
    depth: 2,
    draft: false,
    overrideAccess: false,
  })

  for (const post of postResult.docs || []) {
    const slug = ensureString(post?.slug)
    if (!slug) continue
    const categories = Array.isArray(post?.categories)
      ? post.categories
          .filter((entry) => entry && typeof entry === 'object')
          .map((entry) => ensureString(entry?.title))
          .filter(Boolean)
      : []
    const subtitle = categories.length > 0 ? categories.join(' • ') : ensureString(post?.meta?.description)
    const heroImage = resolveMediaUrl(post?.heroImage) || resolveMediaUrl(post?.meta?.image)

    descriptors.push({
      relativePath: `posts/${slug}.${OG_EXTENSION}`,
      title: ensureString(post?.title) || slug,
      subtitle,
      palette: {
        color1: '#2b3dea',
        color2: '#3f4ef4',
        color3: '#2634cb',
      },
    })

    const articlePalette = post?.articleHeroPalette || {}
    descriptors.push({
      relativePath: `articles/${slug}.${OG_EXTENSION}`,
      title: ensureString(post?.title) || slug,
      subtitle,
      palette: {
        color1: ensureString(articlePalette.color1) || '#2b3dea',
        color2: ensureString(articlePalette.color2) || '#4d2fd0',
        color3: ensureString(articlePalette.color3) || '#0f8f7a',
      },
    })
  }

  const categoryResult = await payload.find({
    collection: 'categories',
    limit: CMS_CATEGORY_LIMIT,
    pagination: false,
    depth: 1,
    draft: false,
    overrideAccess: false,
  })

  for (const category of categoryResult.docs || []) {
    const slug = ensureString(category?.slug)
    if (!slug) continue
    descriptors.push({
      relativePath: `archives/article-category-${slug}.${OG_EXTENSION}`,
      title: ensureString(category?.title) || slug.replaceAll('-', ' '),
      subtitle: 'Browse articles in this category.',
      palette: {
        color1: '#2b3dea',
        color2: '#4d2fd0',
        color3: '#0f8f7a',
      },
    })
  }

  descriptors.push({
    relativePath: `archives/posts.${OG_EXTENSION}`,
    title: ensureString(postsContent.heading) || 'Posts',
    subtitle: '',
    palette: {
      color1: '#1e40af',
      color2: '#0f766e',
      color3: '#1e3a8a',
    },
  })

  descriptors.push({
    relativePath: `archives/articles.${OG_EXTENSION}`,
    title: ensureString(articlesContent.heading) || 'Articles',
    subtitle: ensureString(articlesContent.heroSubtitle),
    palette: {
      color1: '#2b3dea',
      color2: '#4d2fd0',
      color3: '#0f8f7a',
    },
  })

  descriptors.push({
    relativePath: `archives/search.${OG_EXTENSION}`,
    title: ensureString(searchContent.heading) || 'Search',
    subtitle: ensureString(fallbacks.metadata.search.description),
    palette: {
      color1: '#1e3a8a',
      color2: '#0891b2',
      color3: '#1d4ed8',
    },
  })

  return descriptors
}

async function main() {
  await rm(OUTPUT_DIR, { recursive: true, force: true })
  await mkdir(OUTPUT_DIR, { recursive: true })

  const { default: config } = await import('@payload-config')
  const payload = await getPayload({ config })
  const descriptors = await buildDescriptors(payload)

  log(`[og] using preview base URL: ${BASE_URL}`)
  log(`[og] generating ${descriptors.length} images...`)

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--use-angle=swiftshader',
      '--use-gl=angle',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
    ],
  })
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
  })
  const page = await context.newPage()

  try {
    for (const descriptor of descriptors) {
      await captureDescriptor(page, descriptor)
      log(`[og] wrote ${descriptor.relativePath}`)
    }
  } finally {
    await context.close()
    await browser.close()
  }

  log(`[og] done. Output directory: ${OUTPUT_DIR}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exit(1)
  })
