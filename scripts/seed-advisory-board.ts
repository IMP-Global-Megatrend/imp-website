/**
 * Upserts Advisory Board media + advisors and links them on the about-us page.
 * Idempotent: matches media by sourceUrl and advisors by name.
 */
import dotenv from 'dotenv'
import path from 'node:path'
import { readFile } from 'node:fs/promises'

import aboutUsContent from '@/constants/about-us-content.json'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const DOCS_MEDIA_DIR = path.resolve(
  process.cwd(),
  'docs/about-us-advisory-board-14-04-2026_media/media',
)

type AdvisorSeed = {
  key: string
  name: string
  roleTitle: string
  imageFile: string
  bio: string
  sortOrder: number
}

const ADVISORS: AdvisorSeed[] = [
  {
    key: 'alois-j-wiederkehr',
    name: 'Alois J. Wiederkehr',
    roleTitle: 'Senior Advisor to the Fund',
    imageFile: 'image1.jpeg',
    sortOrder: 0,
    bio: [
      'Alois founded our Family Office in 1989, establishing a principled, multi-generational foundation for capital stewardship. As a Member of the Advisory Board and Senior Advisor to the fund, he brings decades of experience advising UHNW individuals and entrepreneurial families in private banking, cross-border wealth structuring, and long-term asset management, guided by discretion, fiduciary responsibility, and a strong commitment to legacy preservation.',
      'With his comprehensive understanding of international capital markets and international ownership structures, Alois shapes our investment orientation through a philosophy centered on preservation, measured growth, and intergenerational continuity. His perspective reflects prudence, consistency, and a deep respect for legacy, ensuring stability across market cycles. He is fluent in German, English, French, and Spanish, and maintains longstanding relationships within global financial and entrepreneurial circles.',
    ].join('\n\n'),
  },
  {
    key: 'karl-bieri',
    name: 'Karl Bieri',
    roleTitle: 'Mobility and Transportation Expert',
    imageFile: 'image2.jpg',
    sortOrder: 1,
    bio: [
      'Karl is a leading expert in the automotive industry, with longstanding experience in electrification, mobility innovation, and the evolving global transportation ecosystem. He is the co-founder and Chairman of the Board of Auto Zürich AG, the largest automotive trade show in Switzerland. As a Member of the Advisory Board, he contributes extensive industry expertise and strategic insight into technological transformation, competitive positioning, and long-term sector developments across the automotive value chain.',
      'With his comprehensive understanding of international mobility markets and complex industry structures, Karl supports our investment orientation through a disciplined assessment of structural trends, innovation cycles, and capital allocation opportunities. His perspective combines forward-looking analysis with practical industry engagement, ensuring informed positioning within a rapidly evolving sector. He is fluent in German and English and maintains a well-established international automotive network.',
    ].join('\n\n'),
  },
  {
    key: 'dominik-burkart',
    name: 'Dominik Burkart',
    roleTitle: 'Economic Power Shifts Expert',
    imageFile: 'image3.png',
    sortOrder: 2,
    bio: [
      'Dominik is a Member of the Board of Directors of Pilatus Aircraft Ltd, where he has been serving since 2014. In this role, he contributes to key strategic decisions, including international expansion and long-term development. As a member of the Advisory Board, he brings expertise in economic power shifts with a particular focus on ownership structures, capital allocation, and sustainable value creation.',
      'His background in finance and investments, combined with his understanding of economic dynamics and industrial value chains, provides valuable insight into structural transformations shaping markets. Drawing on this expertise, he supports the fund’s investment orientation through a disciplined assessment of geopolitical developments, regional growth dynamics, and evolving capital flows. He is fluent in German and English.',
    ].join('\n\n'),
  },
  {
    key: 'julius-hargitai',
    name: 'Julius Hargitai',
    roleTitle: 'Smart Infrastructure Expert',
    imageFile: 'image4.jpg',
    sortOrder: 3,
    bio: [
      'Julius founded Financial Intermediary KKJ Company, a boutique financial intermediary specializing in private placements and off-market investment opportunities across Europe and Southeast Asia. The firm connects investors with high-potential real estate and infrastructure assets while enabling early- and growth-stage companies to access capital through targeted and efficient investment matchmaking. As a member of the Advisory Board, he brings analytical depth and expertise in organizational design, behavioral economics, and executive decision architecture.',
      'Through his experience in governance, incentive alignment, and strategic execution, Julius helps strengthen the robustness of our operating framework. His insights into complex decision environments support disciplined strategic processes and the organization’s long-term positioning in smart infrastructure, smart cities, and technology-driven urban ecosystems. He is fluent in German, English, and Hungarian.',
    ].join('\n\n'),
  },
  {
    key: 'jens-kruse',
    name: 'Jens Kruse',
    roleTitle: 'Technology and AI Expert',
    imageFile: 'image5.jpeg',
    sortOrder: 4,
    bio: [
      'Jens is Co-Manager of a global equity portfolio at Chi Fu Investments Group in Zürich. Chi Fu Investments is a multinational financial holding company headquartered in Shanghai, with offices in Taipei, Hong Kong, Budapest, and New York. Jens joined the firm in 2018. As a member of the Advisory Board, Jens brings more than three decades of experience in global equity markets and the international asset management industry.',
      'His extensive background in portfolio management, institutional distribution, and strategic market development, combined with his broad international network across the financial industry, provides valuable insight into evolving investment landscapes and investor expectations. Drawing on his experience and global network, he supports the organization’s tactical positioning with a particular focus on technological innovation, artificial intelligence, and data-driven investment and decision frameworks. Jens is fluent in German, English, French, and Italian.',
    ].join('\n\n'),
  },
  {
    key: 'bianca-sacherer',
    name: 'Dr. med. univ. Bianca Sacherer',
    roleTitle: 'Healthcare and Longevity Expert',
    imageFile: 'image6.png',
    sortOrder: 5,
    bio: [
      'Bianca founded Med for Balance, a boutique medical practice dedicated to individualized and integrative care. Her work is guided by the principle that vitality, well-being, and natural beauty are closely interconnected and best achieved through balance and a holistic understanding of the body. As a member of the Advisory Board, she contributes expertise in preventive health, longevity, and personalized treatment concepts, offering perspectives on healthcare innovation and evolving demographic trends.',
      'As Medical Director of her practice, she provides highly individualized care tailored to the needs of her patients. Her clinical work combines classical internal medicine with bioidentical hormone therapy and individualized better aging concepts, complemented by elements of traditional Chinese medicine as well as specialized supplements, infusion therapies, and aesthetic treatments. She is fluent in German and English.',
    ].join('\n\n'),
  },
]

function mimeTypeFromFilename(filename: string): string {
  const ext = path.extname(filename).toLowerCase()
  if (ext === '.png') return 'image/png'
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg'
  return 'application/octet-stream'
}

async function upsertPortraitMedia(
  payload: Awaited<ReturnType<typeof import('payload').getPayload>>,
  row: AdvisorSeed,
): Promise<number> {
  const sourceUrl = `local:advisory-board:${row.key}`
  const existing = await payload.find({
    collection: 'media',
    where: { sourceUrl: { equals: sourceUrl } },
    limit: 1,
    pagination: false,
    depth: 0,
    overrideAccess: true,
  })
  const found = existing.docs?.[0]
  if (found?.id != null) return Number(found.id)

  const absolutePath = path.join(DOCS_MEDIA_DIR, row.imageFile)
  const data = await readFile(absolutePath)
  const name = path.basename(row.imageFile)

  const created = await payload.create({
    collection: 'media',
    data: {
      alt: `Portrait of ${row.name}`,
      sourceUrl,
    },
    file: {
      name,
      data,
      mimetype: mimeTypeFromFilename(name),
      size: data.byteLength,
    },
    depth: 0,
    overrideAccess: true,
    context: { disableRevalidate: true },
  })

  return Number(created.id)
}

async function upsertAdvisor(
  payload: Awaited<ReturnType<typeof import('payload').getPayload>>,
  row: AdvisorSeed,
  photoId: number,
): Promise<number> {
  const existing = await payload.find({
    collection: 'advisors',
    where: { name: { equals: row.name } },
    limit: 1,
    pagination: false,
    depth: 0,
    overrideAccess: true,
  })
  const found = existing.docs?.[0]
  const data = {
    name: row.name,
    roleTitle: row.roleTitle,
    bio: row.bio,
    photo: photoId,
    sortOrder: row.sortOrder,
  }

  if (found?.id != null) {
    const updated = await payload.update({
      collection: 'advisors',
      id: found.id,
      data,
      depth: 0,
      overrideAccess: true,
      context: { disableRevalidate: true },
    })
    return Number(updated.id)
  }

  const created = await payload.create({
    collection: 'advisors',
    data,
    depth: 0,
    overrideAccess: true,
    context: { disableRevalidate: true },
  })
  return Number(created.id)
}

async function main() {
  const [{ default: config }, { getPayload }] = await Promise.all([
    import('@payload-config'),
    import('payload'),
  ])
  const payload = await getPayload({ config })

  const advisorIds: number[] = []
  for (const row of ADVISORS) {
    const photoId = await upsertPortraitMedia(payload, row)
    const advisorId = await upsertAdvisor(payload, row, photoId)
    advisorIds.push(advisorId)
  }

  const pageResult = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'about-us' } },
    limit: 1,
    pagination: false,
    depth: 0,
    overrideAccess: true,
  })
  const page = pageResult.docs?.[0]
  if (!page?.id) throw new Error('about-us page not found.')

  const heading =
    typeof aboutUsContent.advisoryBoard?.heading === 'string'
      ? aboutUsContent.advisoryBoard.heading
      : 'Advisory Board'
  const intro =
    typeof aboutUsContent.advisoryBoard?.intro === 'string'
      ? aboutUsContent.advisoryBoard.intro
      : ''

  await payload.update({
    collection: 'pages',
    id: page.id,
    depth: 0,
    overrideAccess: true,
    data: {
      aboutUsAdvisoryBoardHeading: heading,
      aboutUsAdvisoryBoardIntro: intro,
      aboutUsAdvisors: advisorIds,
      // Pages use drafts; anonymous site reads only the published revision.
      _status: 'published',
    },
    context: { disableRevalidate: true },
  })

  console.log(
    JSON.stringify(
      {
        success: true,
        pageId: page.id,
        advisorIds,
        heading,
      },
      null,
      2,
    ),
  )
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
