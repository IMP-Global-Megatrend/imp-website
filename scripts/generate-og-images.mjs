import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import opentype from 'opentype.js'
import sharp from 'sharp'

const WIDTH = 1200
const HEIGHT = 630

const outputDir = path.resolve('public/images/og')

const pages = [
  {
    filename: 'home-hero-og.png',
    title: 'Investing in the World of Tomorrow',
    subtitle: 'IMP Global Megatrend Umbrella Fund',
    colorA: '#1f3bff',
    colorB: '#5f2eff',
  },
  {
    filename: 'fund-og.png',
    title: 'The Fund',
    subtitle: 'Structure, objective, and share classes',
    colorA: '#2b3dea',
    colorB: '#0ea5e9',
  },
  {
    filename: 'megatrends-og.png',
    title: 'Our Megatrends',
    subtitle: 'Six structural trends shaping long-term growth',
    colorA: '#2563eb',
    colorB: '#16a34a',
  },
  {
    filename: 'portfolio-strategy-og.png',
    title: 'Portfolio Strategy',
    subtitle: 'High-conviction thematic approach',
    colorA: '#1d4ed8',
    colorB: '#9333ea',
  },
  {
    filename: 'performance-analysis-og.png',
    title: 'Performance Analysis',
    subtitle: 'Charts, metrics, and share class details',
    colorA: '#0040ff',
    colorB: '#e11d48',
  },
  {
    filename: 'about-us-og.png',
    title: 'About Us',
    subtitle: 'Meet the team behind the strategy',
    colorA: '#4338ca',
    colorB: '#0f766e',
  },
  {
    filename: 'contact-us-og.png',
    title: 'Contact Us',
    subtitle: 'Get in touch with MRB Fund Partners AG',
    colorA: '#1d4ed8',
    colorB: '#0f766e',
  },
  {
    filename: 'newsletter-subscription-og.png',
    title: 'Newsletter Subscription',
    subtitle: 'Updates on markets, fund news, and megatrends',
    colorA: '#1e3a8a',
    colorB: '#7c3aed',
  },
  {
    filename: 'privacy-policy-og.png',
    title: 'Privacy Policy',
    subtitle: 'Data protection statement and privacy notice',
    colorA: '#334155',
    colorB: '#1d4ed8',
  },
  {
    filename: 'legal-information-og.png',
    title: 'Legal Information',
    subtitle: 'Regulatory and legal disclosures',
    colorA: '#0f172a',
    colorB: '#2563eb',
  },
  {
    filename: 'posts-og.png',
    title: 'Posts',
    subtitle: 'Insights and updates from IMP Global Megatrend',
    colorA: '#1e40af',
    colorB: '#0f766e',
  },
  {
    filename: 'search-og.png',
    title: 'Search',
    subtitle: 'Find articles, updates, and insights',
    colorA: '#1e3a8a',
    colorB: '#0891b2',
    useSolidPrimaryBackground: true,
    showLogoWithText: true,
    showDomain: false,
  },
]

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function fitFontSize(font, text, initialSize, minSize, maxWidth) {
  let size = initialSize
  while (size > minSize) {
    const width = font.getAdvanceWidth(text, size)
    if (width <= maxWidth) return size
    size -= 2
  }
  return minSize
}

async function renderOgImage(page, assets) {
  const { logoIconBuffer, safiroFont, safiroRegularFont, manualeItalicFont } = assets
  const topLabelPrefix = 'IMP Global Megatrend '
  const topLabelLightWord = 'Umbrella Fund'
  const topLabelSize = 45
  const topLabelX = 142
  const topLabelY = 86
  const topLabelPrefixWidth = safiroFont.getAdvanceWidth(topLabelPrefix, topLabelSize)
  const topLabelLightWidth = safiroRegularFont.getAdvanceWidth(topLabelLightWord, topLabelSize)

  const topLabelPrefixPath = safiroFont.getPath(topLabelPrefix, topLabelX, topLabelY, topLabelSize).toPathData(3)
  const topLabelLightPath = safiroRegularFont
    .getPath(topLabelLightWord, topLabelX + topLabelPrefixWidth, topLabelY, topLabelSize)
    .toPathData(3)
  const titleText = escapeXml(page.title)
  const titleSize = fitFontSize(safiroFont, titleText, 88, 58, WIDTH - 172)
  const titlePath = safiroFont.getPath(titleText, 86, 332, titleSize).toPathData(3)
  const subtitlePath = manualeItalicFont.getPath(page.subtitle, 86, 412, 44).toPathData(3)

  const background = sharp({
    create: {
      width: WIDTH,
      height: HEIGHT,
      channels: 4,
      background: '#2b3dea',
    },
  })

  const textLayerSvg = `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <path d="${topLabelPrefixPath}" fill="#ffffff"/>
    <path d="${topLabelLightPath}" fill="#ffffff"/>
    <path d="${titlePath}" fill="#ffffff"/>
    <path d="${subtitlePath}" fill="#ffffff"/>
  </svg>
  `.trim()

  return background
    .composite([
      { input: logoIconBuffer, left: 86, top: 52 },
      { input: Buffer.from(textLayerSvg), left: 0, top: 0 },
    ])
    .png({ compressionLevel: 9, quality: 90 })
    .toBuffer()
}

async function main() {
  await mkdir(outputDir, { recursive: true })
  const safiroFont = await opentype.load(path.resolve('public/fonts/safiro/safiro-semibold-webfont.woff'))
  const safiroRegularFont = await opentype.load(path.resolve('public/fonts/safiro/safiro-regular-webfont.woff'))
  const manualeItalicFont = await opentype.load(path.resolve('public/fonts/manuale/manuale-italic-variable.ttf'))

  const logoIconSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28">
    <path fill="#ffffff" d="M16.091 28C22.668 28 28 22.668 28 16.091c0-6.576-5.332-11.908-11.909-11.908-6.576 0-11.908 5.332-11.908 11.908C4.183 22.668 9.515 28 16.09 28" />
    <path fill="#ffffff" d="M4.708 27.474c-6.274-6.274-6.274-16.48 0-22.765A15.97 15.97 0 0 1 16.091 0c4.309 0 8.343 1.669 11.383 4.709L25.863 6.32C20.468.949 11.703.949 6.32 6.331s-5.383 14.149 0 19.532z" />
  </svg>
  `.trim()
  const logoIconBuffer = await sharp(Buffer.from(logoIconSvg))
    .resize(44, 44, { fit: 'contain' })
    .png()
    .toBuffer()

  const assets = {
    logoIconBuffer,
    safiroFont,
    safiroRegularFont,
    manualeItalicFont,
  }

  await Promise.all(
    pages.map(async (page) => {
      const outputPath = path.join(outputDir, page.filename)
      const pngBuffer = await renderOgImage(page, assets)
      await sharp(pngBuffer).toFile(outputPath)
    }),
  )

  // eslint-disable-next-line no-console
  console.log(`Generated ${pages.length} OG images in ${outputDir}`)
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error)
  process.exit(1)
})
