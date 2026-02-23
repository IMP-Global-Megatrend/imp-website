import configPromise from '@payload-config'
import { cache } from 'react'
import { getPayload } from 'payload'

type RegulatoryItem = {
  label: string
  value: string
}

type TrendItem = {
  title: string
  body: string
  tickers: [string, string][]
}

type DownloadItem = {
  label: string
  href: string
}

export type HomeCMSContent = {
  hero: {
    heading: string
    subtitle: string
    ctaLabel: string
    ctaHref: string
  }
  regulatoryItems: RegulatoryItem[]
  trends: TrendItem[]
  downloads: DownloadItem[]
  regulatoryNotice: {
    title: string
    body: string
    address: string
  }
}

const fallbackHomeContent: HomeCMSContent = {
  hero: {
    heading: 'Investing in the World of Tomorrow Today',
    subtitle: 'Harnessing global megatrends to unlock long-term growth.',
    ctaLabel: 'Explore Our Megatrends',
    ctaHref: '/megatrends',
  },
  regulatoryItems: [
    { label: 'Regulatory Structure', value: 'UCITS' },
    { label: 'Portfolio Manager', value: 'MRB Fund Partners AG' },
    { label: 'Fund Administrator', value: 'VP Fund Solutions (Liechtenstein) AG' },
    { label: 'Custodian Bank', value: 'VP Bank (Liechtenstein) AG' },
    { label: 'Audit Company', value: 'Grant Thornton AG' },
    { label: 'Lichtenstein', value: 'FMA Approved' },
    { label: 'Switzerland', value: 'FINMA Approved' },
    { label: 'Tax Transparency', value: 'CH, LI' },
    { label: 'Sales Restrictions', value: 'USA' },
    { label: 'SFDR', value: 'Article 6' },
  ],
  trends: [
    {
      title: 'Technology/Technological Advancements',
      body: 'Innovation, particularly in areas such as artificial intelligence, machine learning, quantum computing, and the Internet of Things. These technologies are not only modifying existing industries but also creating entirely new market segments. Central to these advancements are semiconductors, which underpin data processing, enable AI algorithms, and drive efficiencies in sectors ranging from cloud computing to autonomous systems and industrial automation. Cybersecurity also remains a critical focal point, safeguarding digital ecosystems from an increasingly sophisticated threat landscape.',
      tickers: [
        ['NVDA', 'NVIDIA Corp'],
        ['GOOG', 'Alphabet Inc'],
      ],
    },
    {
      title: 'Changing Consumer Behavior/Demographics',
      body: 'Demographic transformations, including aging populations, urbanization, and increasingly digital-centric lifestyles are reshaping global demand dynamics. The growth of the mobile-first consumer is particularly pronounced, as smartphones and mobile applications become the preeminent medium for e-commerce, entertainment, and service delivery. These transferences are compounded by the demand for healthcare innovations driven by aging societies and the growth of intergenerational wealth transfer.',
      tickers: [
        ['AMZN', 'Amazon.com Inc'],
        ['WMT', 'Walmart Inc'],
      ],
    },
    {
      title: 'Healthcare/Longevity Revolution',
      body: 'The healthcare sector is undergoing a paradigm shift, driven by breakthroughs in biotechnology, genomics, digital health, and personalized medicine. These innovations are reshaping patient care and improving outcomes through robotic surgery, extending life expectancy, and redefining the future of wellness. The advent of gene editing, wearable health technologies, and advanced medical devices is creating exponential growth opportunities for investors in medtech, biopharma, and healthcare infrastructure.',
      tickers: [
        ['GALD SW', 'Galderma Group AG'],
        ['ISRG', 'Intuitive Surgical Inc'],
      ],
    },
    {
      title: 'Shift in Economic Power',
      body: 'Transformation in global economic power, particularly in Asia and Latin America, is driving an unprecedented wave of growth in emerging markets. The expanding middle class in these regions is fueling an increase in consumption across a diverse array of sectors, including consumer goods, luxury, and digital services. Furthermore, the rapid adoption of digital currencies and the rise of fintech solutions are disrupting traditional financial systems, enabling cross-border economic integration and reducing friction in global transactions.',
      tickers: [
        ['MELI', 'MercadoLibre Inc'],
        ['700 HK', 'Tencent Holdings Ltd'],
      ],
    },
    {
      title: 'Mobility/Transportation',
      body: 'The accessibility of fundamental transformation is driven by the adoption of electric vehicles, autonomous driving technologies, and mobility-as-a-service platforms. The deployment of self-driving cars, trucks, and drones has the potential to dramatically enhance efficiency and safety while reducing environmental impact. These innovations are complemented by the development of smart infrastructure, which aims to optimize traffic flows and reduce congestion.',
      tickers: [
        ['TSLA', 'Tesla Inc'],
        ['DUK', 'Duke Energy Corp'],
      ],
    },
    {
      title: 'Smart Infrastructure/Smart City',
      body: 'Urbanization, digitalization, and electrification are accelerating the transition toward smarter, more connected infrastructure. Advanced technologies such as artificial intelligence, Internet of Things, 5G, edge computing, and real-time analytics are increasingly embedded into smart housing, transportation systems, energy grids, utilities, and public services. As demand grows, investments are rising across key sectors including construction, data centers, transmission networks, energy, and telecommunications, highlighting the need for scalable, adaptive systems.',
      tickers: [
        ['PRY IM', 'Prysmian S.p.A'],
        ['NBIS', 'Nebius Group N.V.'],
      ],
    },
  ],
  downloads: [
    {
      label: 'Factsheet USD',
      href: '/impgmt-clone/www.impgmtfund.com/_files/ugd/037a25_e3e73c35d566433fa958a54696b69633.pdf',
    },
    {
      label: 'Factsheet CHF Hedged',
      href: '/impgmt-clone/www.impgmtfund.com/_files/ugd/037a25_671093d7123f482e9e90bf53264f0f85.pdf',
    },
    {
      label: 'Fund Commentary',
      href: '/impgmt-clone/www.impgmtfund.com/_files/ugd/037a25_4f821338d34e4ad082c86d13bd46c757.pdf',
    },
    {
      label: 'Presentation',
      href: '/impgmt-clone/www.impgmtfund.com/_files/ugd/037a25_eb4acc9f30f64bc6a3cb83cd325b4333.pdf',
    },
  ],
  regulatoryNotice: {
    title: 'Regulatory Notice',
    body: 'Portfolio management of the IMP Global Megatrend Umbrella Fund is entrusted to MRB Fund Partners AG. In this document and all related marketing materials, the pronouns "we," "us," and "our" refer exclusively to MRB Fund Partners AG in relation to any investment decisions and regulated portfolio-management activities.',
    address: 'Fraumünsterstrasse 9 · 8001 Zürich · www.mrbpartner.ch',
  },
}

function richTextToParagraphs(richText: unknown): string[] {
  const root = (richText as { root?: { children?: Array<Record<string, unknown>> } } | null)?.root
  const children = Array.isArray(root?.children) ? root.children : []

  return children
    .map((node) => {
      const textChildren = Array.isArray(node?.children)
        ? (node.children as Array<Record<string, unknown>>)
        : []

      const text = textChildren
        .filter((child) => child?.type === 'text' && typeof child.text === 'string')
        .map((child) => child.text as string)
        .join('')
        .trim()

      return text
    })
    .filter(Boolean)
}

function parseRegulatoryItems(blockText: string): RegulatoryItem[] {
  const lines = blockText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const items = lines
    .map((line) => {
      const [label, ...rest] = line.split(':')
      const value = rest.join(':').trim()
      if (!label || !value) return null
      return { label: label.trim(), value }
    })
    .filter((item): item is RegulatoryItem => item !== null)

  return items.length > 0 ? items : fallbackHomeContent.regulatoryItems
}

function parseTickers(line: string): [string, string][] {
  const cleaned = line.replace('Representative holdings:', '').trim()
  if (!cleaned) return []

  return cleaned
    .split(',')
    .map((entry) => entry.trim())
    .map((entry) => {
      const match = entry.match(/^(.+?)\s*\((.+)\)$/)
      if (!match) return null
      return [match[1].trim(), match[2].trim()] as [string, string]
    })
    .filter((ticker): ticker is [string, string] => ticker !== null)
}

function parseDownloads(blockText: string): DownloadItem[] {
  const lines = blockText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(1)

  const items = lines
    .map((line) => {
      const [label, ...rest] = line.split(':')
      const href = rest.join(':').trim()
      if (!label || !href) return null
      return { label: label.trim(), href }
    })
    .filter((item): item is DownloadItem => item !== null)

  return items.length > 0 ? items : fallbackHomeContent.downloads
}

export const getHomeCMSContent = cache(async (): Promise<HomeCMSContent> => {
  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'pages',
      limit: 1,
      pagination: false,
      where: {
        slug: { equals: 'home' },
      },
    })

    const page = result.docs?.[0]
    if (!page) return fallbackHomeContent

    const heroParagraphs = richTextToParagraphs(page.hero?.richText)
    const heroSource = heroParagraphs[0] ?? ''
    const heroSplit = heroSource.split('Harnessing')
    const heroHeading = (heroSplit[0] ?? '').replace(/\.+$/, '').trim()
    const heroSubtitle = heroSplit[1] ? `Harnessing${heroSplit[1]}`.trim() : ''

    const contentBlocks = (page.layout ?? [])
      .filter((block) => block?.blockType === 'content')
      .map((block) => {
        const firstCol = block?.columns?.[0]
        const paragraphs = richTextToParagraphs(firstCol?.richText)
        return paragraphs
      })

    const regulatoryBlockText = contentBlocks[0]?.[0] ?? ''
    const trendBlocks = contentBlocks.slice(1, 7)
    const downloadsBlockText = contentBlocks[7]?.[0] ?? ''
    const noticeBlock = contentBlocks[8] ?? []

    const trends = trendBlocks
      .map((paragraphs) => {
        const [title, body, holdings] = paragraphs
        if (!title || !body) return null
        return {
          title,
          body,
          tickers: parseTickers(holdings ?? ''),
        }
      })
      .filter((trend): trend is TrendItem => trend !== null)

    return {
      hero: {
        heading: heroHeading || fallbackHomeContent.hero.heading,
        subtitle: heroSubtitle || fallbackHomeContent.hero.subtitle,
        ctaLabel: fallbackHomeContent.hero.ctaLabel,
        ctaHref: fallbackHomeContent.hero.ctaHref,
      },
      regulatoryItems:
        regulatoryBlockText.length > 0
          ? parseRegulatoryItems(regulatoryBlockText)
          : fallbackHomeContent.regulatoryItems,
      trends: trends.length > 0 ? trends : fallbackHomeContent.trends,
      downloads:
        downloadsBlockText.length > 0
          ? parseDownloads(downloadsBlockText)
          : fallbackHomeContent.downloads,
      regulatoryNotice: {
        title: noticeBlock[0] || fallbackHomeContent.regulatoryNotice.title,
        body: noticeBlock[1] || fallbackHomeContent.regulatoryNotice.body,
        address: noticeBlock[2] || fallbackHomeContent.regulatoryNotice.address,
      },
    }
  } catch {
    return fallbackHomeContent
  }
})
