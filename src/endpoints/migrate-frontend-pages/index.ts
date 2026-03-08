import type { Payload } from 'payload'
import { plainTextToLexical } from '@/endpoints/wix-import/converters/rich-text'

type FrontendPageSeed = {
  slug: string
  title: string
  hero: string
  sections: string[]
  heroCtaLabel?: string
  heroCtaHref?: string
  contactCompanyName?: string
  contactAddress?: string
  contactPhone?: string
  contactEmail?: string
  contactWebsite?: string
  contactConsentText?: string
  newsletterIntroTitle?: string
  newsletterIntroBody?: string
  newsletterConsentText?: string
  newsletterSubmitLabel?: string
}

const frontendPages: FrontendPageSeed[] = [
  {
    slug: 'home',
    title: 'Home',
    hero: 'Investing in the World of Tomorrow Today. Harnessing global megatrends to unlock long-term growth.',
    heroCtaLabel: 'Explore Our Megatrends',
    heroCtaHref: '/megatrends',
    sections: [
      [
        'Regulatory Structure: UCITS',
        'Portfolio Manager: MRB Fund Partners AG',
        'Fund Administrator: VP Fund Solutions (Liechtenstein) AG',
        'Custodian Bank: VP Bank (Liechtenstein) AG',
        'Audit Company: Grant Thornton AG',
        'Liechtenstein: FMA Approved',
        'Switzerland: FINMA Approved',
        'Tax Transparency: CH, LI',
        'Sales Restrictions: USA',
        'SFDR: Article 6',
      ].join('\n'),
      [
        'Technology / Technological Advancements',
        'Innovation in AI, machine learning, quantum computing, and IoT is transforming industries and creating new market segments. Semiconductors underpin this progress across cloud, autonomy, and industrial automation. Cybersecurity remains critical.',
        'Representative holdings: NVDA (NVIDIA Corp), GOOG (Alphabet Inc).',
      ].join('\n\n'),
      [
        'Changing Consumer Behavior / Demographics',
        'Aging populations, urbanization, and digital-first lifestyles are reshaping demand. Mobile-first consumption and intergenerational wealth transfer are key forces.',
        'Representative holdings: AMZN (Amazon.com Inc), WMT (Walmart Inc).',
      ].join('\n\n'),
      [
        'Healthcare / Longevity Revolution',
        'Breakthroughs in biotech, genomics, digital health, and personalized medicine are improving outcomes and expanding medtech and biopharma opportunities.',
        'Representative holdings: GALD SW (Galderma Group AG), ISRG (Intuitive Surgical Inc).',
      ].join('\n\n'),
      [
        'Shift in Economic Power',
        'Asia and Latin America continue to gain relevance through middle-class expansion, digital services, and fintech adoption, supporting structural growth.',
        'Representative holdings: MELI (MercadoLibre Inc), 700 HK (Tencent Holdings Ltd).',
      ].join('\n\n'),
      [
        'Mobility / Transportation',
        'Electric vehicles, autonomous systems, and mobility-as-a-service are redefining movement and supporting cleaner, safer transport systems.',
        'Representative holdings: TSLA (Tesla Inc), DUK (Duke Energy Corp).',
      ].join('\n\n'),
      [
        'Smart Infrastructure / Smart City',
        'Urbanization, electrification, and digitalization are driving investment in AI, IoT, 5G, grids, construction, utilities, and data infrastructure.',
        'Representative holdings: PRY IM (Prysmian S.p.A), NBIS (Nebius Group N.V.).',
      ].join('\n\n'),
      [
        'Downloads',
        'Factsheet USD: https://www.impgmtfund.com/_files/ugd/037a25_e3e73c35d566433fa958a54696b69633.pdf',
        'Factsheet CHF Hedged: https://www.impgmtfund.com/_files/ugd/037a25_671093d7123f482e9e90bf53264f0f85.pdf',
        'Fund Commentary: https://www.impgmtfund.com/_files/ugd/037a25_4f821338d34e4ad082c86d13bd46c757.pdf',
        'Presentation: https://www.impgmtfund.com/_files/ugd/037a25_eb4acc9f30f64bc6a3cb83cd325b4333.pdf',
      ].join('\n'),
      [
        'Regulatory Notice',
        'Portfolio management of the IMP Global Megatrend Umbrella Fund is entrusted to MRB Fund Partners AG. In related marketing materials, "we", "us", and "our" refer exclusively to MRB Fund Partners AG regarding regulated portfolio-management activities.',
        'Fraumunsterstrasse 9 · 8001 Zurich · www.mrbpartner.ch',
      ].join('\n\n'),
    ],
  },
  {
    slug: 'fund',
    title: 'The Fund',
    hero: 'The IMP Global Megatrend Umbrella Fund. Investing in the Forces That Shape Tomorrow.',
    sections: [
      [
        'Our investment focus lies in six defining megatrends: Technology/Technological Advancements, Changing Consumer Behavior/Demographics, Healthcare/Longevity Revolution, Shift in Economic Power, Mobility/Transportation, and Smart Infrastructure/Smart City.',
        'By identifying and investing in companies and sectors aligned with these structural changes, we aim to deliver sustainable, above-average long-term returns.',
      ].join('\n\n'),
      [
        'USD Share Class',
        'Fee structure: Up to 1.5% all-in, sign-on fee with performance fee with high-water mark.',
        'ISIN: LI0325349897 · WKN: A2DWTX · Bloomberg: IMPGLMT LE',
      ].join('\n\n'),
      [
        'CHF Hedged Share Class',
        'Fee structure: Up to 1.27% all-in, waived sign-on fee with performance fee with high-water mark (Soft-Close).',
        'ISIN: LI1454290381 · WKN: A41AWF · Bloomberg: IMPGMCH LE',
      ].join('\n\n'),
      [
        'Fund details',
        'Liquidity: Daily and T+3 settlement',
        'Asset classes: Global equities, with selective use of funds/ETFs',
        'Regulatory distribution: Switzerland',
        'Structure & jurisdiction: UCITS · Liechtenstein',
        'Investment objective: Focused on above-average, long-term capital appreciation through exposure to transformational megatrends',
        'SFDR classification: Article 6 SFDR',
      ].join('\n'),
    ],
  },
  {
    slug: 'megatrends',
    title: 'Our Megatrends',
    hero: 'The Six Megatrends Powering Our Portfolio.',
    sections: [
      [
        'Technology/Technological Advancements — Redefining what is possible',
        'AI, machine learning, quantum computing, and IoT are transforming industries and business models. Semiconductors are foundational to this shift.',
      ].join('\n\n'),
      [
        'Changing Consumer Behavior/Demographics — A new era of demand',
        'Aging populations, urbanization, and digital-first behavior are reshaping consumption and investment priorities.',
      ].join('\n\n'),
      [
        'Healthcare/Longevity Revolution — Investing in longer, healthier lives',
        'Genomics, digital health, medtech, and AI-enabled diagnostics are improving care and supporting long-term growth.',
      ].join('\n\n'),
      [
        'Shift in Economic Power — Emerging markets at the frontier of growth',
        'Digitally native middle classes and fintech ecosystems are accelerating growth across emerging regions.',
      ].join('\n\n'),
      [
        'Mobility/Transportation — The reinvention of movement',
        'EVs, autonomous driving, and mobility-as-a-service are creating a new mobility stack focused on sustainability and safety.',
      ].join('\n\n'),
      [
        'Smart Infrastructure/Smart City — The backbone of tomorrow',
        'AI, IoT, 5G, and edge computing are embedded in housing, transport, utilities, and public services.',
      ].join('\n\n'),
      [
        'Our thematic framework in action',
        'Each portfolio company must show direct revenue exposure to one or more of the six megatrends.',
      ].join('\n\n'),
    ],
  },
  {
    slug: 'portfolio-strategy',
    title: 'Portfolio Strategy',
    hero: 'Long-term above-average return through global direct and indirect equity investments.',
    sections: [
      [
        'Investment process',
        '1) Global macroeconomic trends and sector selection',
        '2) Idea generation and long-term opportunity identification',
        '3) Due diligence and transparent information gathering',
        '4) Technical and fundamental investment evaluation',
        '5) Diversification, weighting, risk and compliance',
        '6) Best execution and settlement efficiency',
        '7) Continuous monitoring and rebalancing',
        '8) Disciplined buy/sell policy under committee guidelines',
      ].join('\n'),
      [
        'Megatrend allocations',
        'Technology & Technological Advancements: 24.2%',
        'Changing Consumer Behavior & Demographics: 19.8%',
        'Smart Infrastructure & Smart City: 19.2%',
        'Mobility & Transportation: 11.7%',
        'Shift in Economic Power: 11.5%',
        'Healthcare & Longevity Revolution: 10.7%',
        'Fixed Income: 1.3%',
        'Cash: 1.0%',
      ].join('\n'),
      [
        'Geographic allocations',
        'USA: 64.7%',
        'Italy: 7.6%',
        'France: 5.5%',
        'Uruguay: 4.5%',
        'China: 4.3%',
        'Switzerland: 4.2%',
        'Denmark: 2.9%',
        'Netherlands: 1.9%',
        'Turkey: 0.7%',
        'United Kingdom: 0.7%',
      ].join('\n'),
      [
        'Sector allocations',
        'Consumer Discretionary: 24.7%',
        'Info. Technology: 21.7%',
        'Industrials: 12.5%',
        'Healthcare: 10.6%',
        'Consumer Staples: 8.5%',
        'Comm. Services: 8.3%',
        'Utilities: 6.9%',
        'Financials: 3.9%',
      ].join('\n'),
    ],
  },
  {
    slug: 'performance-analysis',
    title: 'Performance Analysis',
    hero: 'Delivering Results Over the Long Term.',
    sections: [
      [
        'Key documents',
        'Full Performance History: https://www.vpbank.com/de/vpfundsolutions/fondsinformationen/fondsdokumentationen',
        'Factsheet USD: https://www.impgmtfund.com/_files/ugd/037a25_e3e73c35d566433fa958a54696b69633.pdf',
        'Factsheet CHF Hedged: https://www.impgmtfund.com/_files/ugd/037a25_671093d7123f482e9e90bf53264f0f85.pdf',
      ].join('\n'),
      [
        'CHF Hedged Share Class',
        'NAV per Share: CHF 93.29',
        'Performance YTD: -0.89%',
        'Performance MTD: -0.89%',
        'As of 31.01.2026',
        'Liquidity: Daily · Trade Day: Banking Day · Settlement: T+3 · Cut-off: 12:00 · All-In Fee: up to 1.27% · Management Fee: 0.50% · Administrative Fees: up to 0.77% · Performance Fee: 10.00% / High-Water Mark',
      ].join('\n\n'),
      [
        'USD Share Class',
        'NAV per Share: USD 192.91',
        'Performance YTD: -0.42%',
        'Performance MTD: -0.42%',
        'As of 31.01.2026',
        'Liquidity: Daily · Trade Day: Banking Day · Settlement: T+3 · Cut-off: 12:00 · All-In Fee: up to 1.50% · Management Fee: 1.00% · Administrative Fees: up to 0.50% · Performance Fee: 10.00% / High-Water Mark',
      ].join('\n\n'),
    ],
  },
  {
    slug: 'about-us',
    title: 'About Us',
    hero: 'Meet the team behind the strategy.',
    sections: [
      'We founded this investment strategy to offer forward-looking investors a way to benefit from the structural forces shaping the next decades - responsibly and with precision.',
      'Stefan Wiederkehr: Portfolio Manager since 2016 with over 17 years in finance and asset management, including executive and portfolio management positions in Liechtenstein.',
      'Karin B. Wiederkehr: Portfolio Manager with over 23 years in finance, asset management and strategic investing, combining portfolio expertise with private equity and governance leadership.',
    ],
  },
  {
    slug: 'contact-us',
    title: 'Contact Us',
    hero: 'Get in touch with MRB Fund Partners AG.',
    sections: [
      'Contact details: Fraumunsterstrasse 9, 8001 Zurich, +41 44 454 25 71, info@mrbpartner.ch, www.mrbpartner.ch.',
      'Form fields: First name, Last name, Phone, Email, Inquiry type (General Inquiry, Investment Request, Request Factsheet), Message, consent to personal data processing.',
    ],
    contactCompanyName: 'MRB Fund Partners AG',
    contactAddress: 'Fraumünsterstrasse 9\n8001 Zürich',
    contactPhone: '+41 44 454 25 71',
    contactEmail: 'info@mrbpartner.ch',
    contactWebsite: 'https://www.mrbpartner.ch/',
    contactConsentText:
      'By submitting this form, I agree to the storage and processing of my personal data for the purpose of responding to my inquiry, in accordance with the GDPR.',
  },
  {
    slug: 'newsletter-subscription',
    title: 'Newsletter Subscription',
    hero: 'Newsletter Subscription. Receive periodic updates on market developments, fund news, and our latest perspectives on global megatrends.',
    sections: [
      'Subscribe to our newsletter',
      'Enter your email address to subscribe to the IMP Global Megatrend newsletter.',
      'By submitting this form, I agree to the storage and processing of my personal data for the purpose of subscribing to our newsletter, in accordance with the GDPR.',
    ],
    newsletterIntroTitle: 'Subscribe to our newsletter',
    newsletterIntroBody:
      'Enter your email address to subscribe to the IMP Global Megatrend newsletter.',
    newsletterConsentText:
      'By submitting this form, I agree to the storage and processing of my personal data for the purpose of subscribing to our newsletter, in accordance with the GDPR.',
    newsletterSubmitLabel: 'Subscribe',
  },
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    hero: 'Data Protection Statement of MRB Fund Partners AG.',
    sections: [
      'We describe how personal data is collected and processed in line with GDPR, Swiss DPA and revDPA.',
      'Personal data is processed for contractual, legal, operational and communication purposes, including client servicing, compliance and infrastructure security.',
      'We may use cookies and analytics tools to improve site operation and user experience.',
      'Data may be transferred to service providers in Switzerland, Europe and the USA with appropriate safeguards.',
      'Data subjects may request access, rectification, deletion, restriction, objection and portability where applicable.',
    ],
  },
  {
    slug: 'legal-information',
    title: 'Regulatory & Legal Information',
    hero: 'Regulatory & Legal Information',
    sections: [
      [
        'This website is for informational purposes only. The information presented here is not an offer, advice, recommendation, or a solicitation to buy or sell securities, fund units or any other financial instruments. All our investment strategies are intended only for professional investors.',
        'The portfolio management of the IMP Global Megatrend Umbrella Fund is entrusted to MRB Fund Partners AG. In this website and all related marketing materials, the pronouns "we," "us," and "our" refer exclusively to MRB Fund Partners AG in relation to any investment decisions and regulated portfolio-management activities.',
      ].join('\n\n'),
      [
        'Regulatory Information',
        'The aim of this document is to deliver details in line with obligations under the Financial Services Act ("FinSA"). It includes insights about MRB Fund Partners AG and the services offered. This notice is solely for informing clients about how applicable statutory requirements on investor protection are implemented under FinSA and/or other regulatory frameworks.',
        'It does not constitute an offer or solicitation by or on behalf of MRB Fund Partners AG to use a service, buy or sell funds or any financial instruments, or participate in a specific trading strategy in any jurisdiction.',
      ].join('\n\n'),
      [
        'Financial services according to FinSA',
        'FinSA governs the offering of financial services and instruments to clients and applies to those who provide financial services, advise clients, and create financial instruments. Under FinSA, relevant financial services include: acquisition or disposal of financial instruments; receipt and transmission of orders; portfolio management; investment advice; and granting loans to finance transactions with financial instruments. Fund units are also covered by FinSA.',
      ].join('\n\n'),
      [
        'Services offered by MRB Fund Partners',
        'When selling funds, MRB Fund Partners may provide a financial service covered by FinSA, namely the acquisition and disposal of collective investment schemes (funds). MRB Fund Partners does not provide additional services such as investment advice or discretionary portfolio management unless these services are explicitly included in a formal contract agreement.',
      ].join('\n\n'),
      [
        'Client classification',
        'MRB Fund Partners classifies clients into retail (private), professional, and institutional categories. Retail clients have the highest level of protection; professional clients are expected to have relevant investment knowledge and experience; institutional clients have the lowest level of regulatory protection due to assumed sophistication and risk-bearing capacity.',
        'Clients may request a change in classification where legal requirements are met.',
      ].join('\n\n'),
      [
        'Opting-In / Opting-Out Options',
        'According to FinSA, certain clients may opt in or opt out of classifications, subject to statutory criteria and required declarations.',
        'Retail clients may opt out to professional status in specific high-net-worth cases. Professional clients may opt in to retail status or opt in/out to institutional status in specific cases. Institutional clients may opt in/out to professional status where permitted.',
      ].join('\n\n'),
      [
        'Ombudsman',
        'MRB Fund Partners AG is affiliated with an ombudsman recognized by the Swiss Federal Department of Finance. Clients may bring unresolved issues to:',
        'Finanzombudsstelle Schweiz (FINOS), Talstrasse 20, 8001 Zurich, Switzerland, +41 44 552 08 00, www.finos.ch',
      ].join('\n\n'),
      [
        'Risks & Other relevant information',
        'This information is provided for informational purposes only and does not constitute an offer, recommendation, advice, or solicitation to buy or sell any securities or financial instruments. It is intended for use by investors in Switzerland and the European Union in accordance with applicable laws and regulations, including MiFID and local legislation.',
        'Any content may contain marketing information within the meaning of MiFID II or FIDLEG. It is not intended for distribution in jurisdictions where such distribution would be unlawful. Investing in securities and financial instruments involves risk, and past performance is not indicative of future results.',
      ].join('\n\n'),
      [
        'Forward-looking statements',
        'This content may contain forward-looking statements involving risks and uncertainties. Actual results may differ materially from those anticipated. There is no obligation to update or revise forward-looking statements.',
      ].join('\n\n'),
      [
        'No liability',
        'MRB Fund Partners AG and its affiliates, directors, officers, employees, and agents accept no liability for direct, indirect, or consequential losses or damages arising from use of or reliance on this information. No representation or warranty is made as to accuracy, completeness, or reliability.',
        'This disclaimer is governed by Swiss law, and disputes are subject to the exclusive jurisdiction of Swiss courts.',
      ].join('\n\n'),
    ],
  },
]

function toContentBlock(text: string) {
  return {
    blockType: 'content' as const,
    columns: [
      {
        size: 'full' as const,
        richText: plainTextToLexical(text),
      },
    ],
  }
}

function getMetaDescription(sections: string[]): string {
  const fallback = 'IMP Global Megatrend Umbrella Fund'
  const first = sections.find(Boolean)?.replace(/\s+/g, ' ').trim()
  if (!first) return fallback
  return first.length > 160 ? `${first.slice(0, 157)}...` : first
}

export async function migrateFrontendPagesToCMS(payload: Payload): Promise<{
  created: number
  updated: number
  errors: string[]
}> {
  const result = { created: 0, updated: 0, errors: [] as string[] }

  for (const page of frontendPages) {
    try {
      const existing = await payload.find({
        collection: 'pages',
        where: { slug: { equals: page.slug } },
        depth: 0,
        limit: 1,
      })

      const data = {
        title: page.title,
        slug: page.slug,
        _status: 'published' as const,
        hero: {
          type: 'lowImpact' as const,
          richText: plainTextToLexical(page.hero),
        },
        layout: page.sections.map((section) => toContentBlock(section)),
        meta: {
          title: page.title,
          description: getMetaDescription(page.sections),
        },
        ...(page.heroCtaLabel ? { heroCtaLabel: page.heroCtaLabel } : {}),
        ...(page.heroCtaHref ? { heroCtaHref: page.heroCtaHref } : {}),
        ...(page.contactCompanyName ? { contactCompanyName: page.contactCompanyName } : {}),
        ...(page.contactAddress ? { contactAddress: page.contactAddress } : {}),
        ...(page.contactPhone ? { contactPhone: page.contactPhone } : {}),
        ...(page.contactEmail ? { contactEmail: page.contactEmail } : {}),
        ...(page.contactWebsite ? { contactWebsite: page.contactWebsite } : {}),
        ...(page.contactConsentText ? { contactConsentText: page.contactConsentText } : {}),
        ...(page.newsletterIntroTitle ? { newsletterIntroTitle: page.newsletterIntroTitle } : {}),
        ...(page.newsletterIntroBody ? { newsletterIntroBody: page.newsletterIntroBody } : {}),
        ...(page.newsletterConsentText ? { newsletterConsentText: page.newsletterConsentText } : {}),
        ...(page.newsletterSubmitLabel ? { newsletterSubmitLabel: page.newsletterSubmitLabel } : {}),
      }

      if (existing.docs[0]) {
        await payload.update({
          collection: 'pages',
          id: existing.docs[0].id,
          data,
          depth: 0,
          context: { disableRevalidate: true },
        })
        result.updated++
        payload.logger.info(`[frontend->cms] Updated page: ${page.slug}`)
      } else {
        await payload.create({
          collection: 'pages',
          data,
          depth: 0,
          context: { disableRevalidate: true },
        })
        result.created++
        payload.logger.info(`[frontend->cms] Created page: ${page.slug}`)
      }
    } catch (error) {
      const msg = `Failed to migrate page "${page.slug}": ${String(error)}`
      result.errors.push(msg)
      payload.logger.error(msg)
    }
  }

  return result
}
