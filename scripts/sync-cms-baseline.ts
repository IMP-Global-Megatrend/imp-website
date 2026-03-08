// @ts-nocheck
import config from '@payload-config'
import { getPayload } from 'payload'
import { migrateFrontendPagesToCMS } from '@/endpoints/migrate-frontend-pages'

type AnyRecord = Record<string, unknown>

async function upsertCMSDoc(
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: string,
  sourceCollectionId: string,
  sourceItemId: string,
  data: AnyRecord,
  textFields: Array<{ key: string; value: string }> = [],
): Promise<void> {
  const existing = await payload.find({
    collection,
    where: { wixItemId: { equals: sourceItemId } },
    limit: 1,
    pagination: false,
    depth: 0,
  })

  const docData = {
    wixCollectionId: sourceCollectionId,
    wixItemId: sourceItemId,
    data,
    textFields,
  }

  if (existing.docs[0]) {
    await payload.update({
      collection,
      id: existing.docs[0].id,
      data: docData,
      depth: 0,
    })
    return
  }

  await payload.create({
    collection,
    data: docData,
    depth: 0,
  })
}

async function seedTrustList(payload: Awaited<ReturnType<typeof getPayload>>) {
  const items = [
    ['Regulatory Structure', 'UCITS'],
    ['Portfolio Manager', 'MRB Fund Partners AG'],
    ['Fund Administrator', 'VP Fund Solutions (Liechtenstein) AG'],
    ['Custodian Bank', 'VP Bank (Liechtenstein) AG'],
    ['Audit Company', 'Grant Thornton AG'],
    ['Liechtenstein', 'FMA Approved'],
    ['Switzerland', 'FINMA Approved'],
    ['Tax Transparency', 'CH, LI'],
    ['Sales Restrictions', 'USA'],
    ['SFDR', 'Article 6'],
  ]

  for (const [index, [label, value]] of items.entries()) {
    const sourceItemId = `trust-${index + 1}`
    await upsertCMSDoc(
      payload,
      'trust-list',
      'TrustList',
      sourceItemId,
      { title_fld: label, description_fld: value, _manualSort: String(100 - index).padStart(3, '0') },
      [
        { key: 'title_fld', value: label },
        { key: 'description_fld', value },
        { key: '_manualSort_', value: String(100 - index).padStart(3, '0') },
      ],
    )
  }
}

async function seedMegatrends(payload: Awaited<ReturnType<typeof getPayload>>) {
  const items = [
    {
      title: 'Technology/Technological Advancements',
      body: 'Innovation, particularly in areas such as artificial intelligence, machine learning, quantum computing, and the Internet of Things. These technologies are not only modifying existing industries but also creating entirely new market segments. Central to these advancements are semiconductors, which underpin data processing, enable AI algorithms, and drive efficiencies in sectors ranging from cloud computing to autonomous systems and industrial automation. Cybersecurity also remains a critical focal point, safeguarding digital ecosystems from an increasingly sophisticated threat landscape.',
      image: '/images/megatrend_technology.png',
      firstCode: 'NVDA',
      firstName: 'NVIDIA Corp',
      secondCode: 'GOOG',
      secondName: 'Alphabet Inc',
    },
    {
      title: 'Changing Consumer Behavior/Demographics',
      body: 'Demographic transformations, including aging populations, urbanization, and increasingly digital-centric lifestyles are reshaping global demand dynamics. The growth of the mobile-first consumer is particularly pronounced, as smartphones and mobile applications become the preeminent medium for e-commerce, entertainment, and service delivery. These transferences are compounded by the demand for healthcare innovations driven by aging societies and the growth of intergenerational wealth transfer.',
      image: '/images/megatrend_consumer.png',
      firstCode: 'AMZN',
      firstName: 'Amazon.com Inc',
      secondCode: 'WMT',
      secondName: 'Walmart Inc',
    },
    {
      title: 'Healthcare/Longevity Revolution',
      body: 'The healthcare sector is undergoing a paradigm shift, driven by breakthroughs in biotechnology, genomics, digital health, and personalized medicine. These innovations are reshaping patient care and improving outcomes through robotic surgery, extending life expectancy, and redefining the future of wellness. The advent of gene editing, wearable health technologies, and advanced medical devices is creating exponential growth opportunities for investors in medtech, biopharma, and healthcare infrastructure.',
      image: '/images/megatrend_healthcare.png',
      firstCode: 'GALD SW',
      firstName: 'Galderma Group AG',
      secondCode: 'ISRG',
      secondName: 'Intuitive Surgical Inc',
    },
    {
      title: 'Shift in Economic Power',
      body: 'Transformation in global economic power, particularly in Asia and Latin America, is driving an unprecedented wave of growth in emerging markets. The expanding middle class in these regions is fueling an increase in consumption across a diverse array of sectors, including consumer goods, luxury, and digital services. Furthermore, the rapid adoption of digital currencies and the rise of fintech solutions are disrupting traditional financial systems, enabling cross-border economic integration and reducing friction in global transactions.',
      image: '/images/megatrend_economic.png',
      firstCode: 'MELI',
      firstName: 'MercadoLibre Inc',
      secondCode: '700 HK',
      secondName: 'Tencent Holdings Ltd',
    },
    {
      title: 'Mobility/Transportation',
      body: 'The accessibility of fundamental transformation is driven by the adoption of electric vehicles, autonomous driving technologies, and mobility-as-a-service platforms. The deployment of self-driving cars, trucks, and drones has the potential to dramatically enhance efficiency and safety while reducing environmental impact. These innovations are complemented by the development of smart infrastructure, which aims to optimize traffic flows and reduce congestion.',
      image: '/images/megatrend_mobility.png',
      firstCode: 'TSLA',
      firstName: 'Tesla Inc',
      secondCode: 'DUK',
      secondName: 'Duke Energy Corp',
    },
    {
      title: 'Smart Infrastructure/Smart City',
      body: 'Urbanization, digitalization, and electrification are accelerating the transition toward smarter, more connected infrastructure. Advanced technologies such as artificial intelligence, Internet of Things, 5G, edge computing, and real-time analytics are increasingly embedded into smart housing, transportation systems, energy grids, utilities, and public services. As demand grows, investments are rising across key sectors including construction, data centers, transmission networks, energy, and telecommunications, highlighting the need for scalable, adaptive systems.',
      image: '/images/megatrend_infrastructure.png',
      firstCode: 'PRY IM',
      firstName: 'Prysmian S.p.A',
      secondCode: 'NBIS',
      secondName: 'Nebius Group N.V.',
    },
  ]

  for (const [index, item] of items.entries()) {
    const sort = String(100 - index).padStart(3, '0')
    await upsertCMSDoc(
      payload,
      'megatrend-dataset',
      'MegatrendDataset',
      `megatrend-${index + 1}`,
      {
        title_fld: item.title,
        description_fld: item.body,
        image_fld: item.image,
        firstStockCode: item.firstCode,
        firstStockName: item.firstName,
        secondStockCode: item.secondCode,
        secondStockName: item.secondName,
        _manualSort: sort,
      },
      [
        { key: 'title_fld', value: item.title },
        { key: 'description_fld', value: item.body },
        { key: 'image_fld', value: item.image },
        { key: 'firstStockCode', value: item.firstCode },
        { key: 'firstStockName', value: item.firstName },
        { key: 'secondStockCode', value: item.secondCode },
        { key: 'secondStockName', value: item.secondName },
        { key: '_manualSort_', value: sort },
      ],
    )
  }
}

async function seedHomepageLinks(payload: Awaited<ReturnType<typeof getPayload>>) {
  await upsertCMSDoc(
    payload,
    'homepage-links',
    'Homepagelinks',
    'homepage-links-1',
    {
      factSheet: 'https://www.impgmtfund.com/_files/ugd/037a25_e3e73c35d566433fa958a54696b69633.pdf',
      factsheetChfHedged:
        'https://www.impgmtfund.com/_files/ugd/037a25_671093d7123f482e9e90bf53264f0f85.pdf',
      fundCommentary:
        'https://www.impgmtfund.com/_files/ugd/037a25_4f821338d34e4ad082c86d13bd46c757.pdf',
      presentation:
        'https://www.impgmtfund.com/_files/ugd/037a25_eb4acc9f30f64bc6a3cb83cd325b4333.pdf',
      exploreMegatrendsTitle: 'Explore Our Megatrends',
      exploreMegatrendsImage: '/images/downloads_icon.png',
    },
    [
      { key: 'factSheet', value: 'https://www.impgmtfund.com/_files/ugd/037a25_e3e73c35d566433fa958a54696b69633.pdf' },
      { key: 'factsheetChfHedged', value: 'https://www.impgmtfund.com/_files/ugd/037a25_671093d7123f482e9e90bf53264f0f85.pdf' },
      { key: 'fundCommentary', value: 'https://www.impgmtfund.com/_files/ugd/037a25_4f821338d34e4ad082c86d13bd46c757.pdf' },
      { key: 'presentation', value: 'https://www.impgmtfund.com/_files/ugd/037a25_eb4acc9f30f64bc6a3cb83cd325b4333.pdf' },
      { key: 'exploreMegatrendsTitle', value: 'Explore Our Megatrends' },
      { key: 'exploreMegatrendsImage', value: '/images/downloads_icon.png' },
    ],
  )
}

async function seedLegalAndContact(payload: Awaited<ReturnType<typeof getPayload>>) {
  await upsertCMSDoc(
    payload,
    'legal-information',
    'LegalInformmation',
    'legal-1',
    {
      title_fld: 'Regulatory Notice',
      richcontent: {
        nodes: [
          { nodes: [{ textData: { text: 'Portfolio management of the IMP Global Megatrend Umbrella Fund is entrusted to MRB Fund Partners AG. In this document and all related marketing materials, the pronouns "we," "us," and "our" refer exclusively to MRB Fund Partners AG in relation to any investment decisions and regulated portfolio-management activities.' } }] },
        ],
      },
    },
    [{ key: 'title_fld', value: 'Regulatory Notice' }],
  )

  await upsertCMSDoc(
    payload,
    'contact-us',
    'ContactUs',
    'contact-1',
    {
      address: 'Fraumünsterstrasse 9\n8001 Zürich',
      websiteName: 'www.mrbpartner.ch',
      websiteUrl: 'https://www.mrbpartner.ch/',
    },
    [
      { key: 'address', value: 'Fraumünsterstrasse 9\n8001 Zürich' },
      { key: 'websiteName', value: 'www.mrbpartner.ch' },
      { key: 'websiteUrl', value: 'https://www.mrbpartner.ch/' },
    ],
  )
}

async function seedFundAttributes(payload: Awaited<ReturnType<typeof getPayload>>) {
  const rows = [
    ['Liquidity', 'Daily and T+3 settlement', 'circleDollar'],
    ['Asset Classes', 'Global equities, with selective use of funds/ETFs', 'boxes'],
    ['Regulatory Distribution', 'Switzerland', 'mapPinCheck'],
    ['Structure & Jurisdiction', 'UCITS · Liechtenstein', 'shieldCheck'],
    ['SFDR-Classification', 'Article 6 SFDR', 'graduationCap'],
    ['USD Share Class ISIN', 'LI0325349897', 'trendingUp'],
    ['USD Share Class WKN', 'A2DWTX', 'trendingUp'],
    ['USD Share Class Bloomberg', 'IMPGLMT LE', 'trendingUp'],
    ['CHF Hedged Share Class ISIN', 'LI1454290381', 'trendingUp'],
    ['CHF Hedged Share Class WKN', 'A41AWF', 'trendingUp'],
    ['CHF Hedged Share Class Bloomberg', 'IMPGMCH LE', 'trendingUp'],
  ]

  for (const [index, [title, description, icon]] of rows.entries()) {
    await upsertCMSDoc(
      payload,
      'fund-attributes',
      'FundAttributes',
      `fund-attr-${index + 1}`,
      {
        title_fld: title,
        description_fld: description,
        icon_fld: icon,
      },
      [
        { key: 'title_fld', value: title },
        { key: 'description_fld', value: description },
        { key: 'icon_fld', value: icon },
      ],
    )
  }
}

async function seedFundDetails(payload: Awaited<ReturnType<typeof getPayload>>) {
  await upsertCMSDoc(
    payload,
    'fund-details',
    'FundDetails',
    'fund-details-1',
    {
      pageTitle: 'Delivering Results Over the Long Term',
      annualPerformanceTitle: 'Annual Performance Graph (2016-2026)',
      usd: 'USD Share Class',
      chf: 'CHF Hedged Share Class',
      navPerShare: 'USD 192.91',
      navPerShare2: 'CHF 93.29',
      performanceYtd: '-0.42%',
      performanceYtd2: '-0.89%',
      dateUsdNew: '31.01.2026',
      dateUsdNew1: '31.01.2026',
      sharpeRatio: '0.06',
      sharpeRatio2: '0.06',
      volatility: '19.75',
      volatility2: '19.75',
      sortinoRatio: '0.09',
      sortinoRatio2: '0.09',
      downsideRisk: '14.16',
      downsideRisk2: '14.16',
      liquidity1: 'Liquidity',
      liquidity: 'Daily',
      liquidity2: 'Daily',
      tradeDay1: 'Trade Day',
      tradeDay: 'Banking Day',
      tradeDay2: 'Banking Day',
      settlement1: 'Settlement',
      settlement: 'T+3',
      settlement2: 'T+3',
      cutoffSubscription1: 'Cut-off Subscription & Redemption (Trade Day)',
      cutoffSubscription: '12:00',
      cutoffSubscription2: '12:00',
      allInFee1: 'All-In Fee',
      allInFee: 'up to 1.50%',
      allInFee2: 'up to 1.27%',
      managementFee1: 'Management Fee',
      managementFee: '1.00%',
      managementFee2: '0.50%',
      administrativeFees1: 'Administrative Fees',
      administrativeFees: 'up to 0.50%',
      administrativeFees2: 'up to 0.77%',
      performanceFee1: 'Performance Fee',
      performanceFee: '10.00% / High-Water Mark',
      performanceFee2: '10.00% / High-Water Mark',
      crystallizationFreq1: 'Crystallization Freq.',
      crystallizationFreq: 'Quarterly',
      crystallizationFreq2: 'Quarterly',
      subscriptionFee1: 'Subscription Fee',
      subscriptionFee: '1.00%',
      subscriptionFee2: '0.00%',
      redemptionFee1: 'Redemption Fee',
      redemptionFee: '2.00%',
      redemptionFee2: '2.00%',
      inceptionDateTitle: 'Inception Date',
      inceptionDateValue: '06.09.2016',
      inceptionDateValue1: '07.10.2025',
      fundCurrencyText: 'Fund Currency',
      fundCurrencyValue: 'USD',
      fundCurrencyValue1: 'CHF',
      inceptionPriceText: 'Inception Price',
      inceptionPriceValue: 'USD 100.00',
      inceptionPriceValue1: 'CHF 100.00',
      minInvestmentText: 'Min. Investment',
      minInvestmentValue: '1.00 Share',
      minInvestmentValue1: '1.00 Share',
      introQuotePrimary:
        'Our investment focus lies in six defining megatrends: Technology/Technological Advancements, Changing Consumer Behavior/Demographics, Healthcare/Longevity Revolution, Shift in Economic Power, Mobility/Transportation, and Smart Infrastructure/Smart City.\nBy identifying and investing in companies and sectors aligned with these structural changes, we aim to deliver sustainable, above-average long-term returns.',
      introQuoteSecondary: '',
    },
    [],
  )
}

async function main() {
  const payload = await getPayload({ config })

  const migration = await migrateFrontendPagesToCMS(payload)
  await seedTrustList(payload)
  await seedMegatrends(payload)
  await seedHomepageLinks(payload)
  await seedLegalAndContact(payload)
  await seedFundAttributes(payload)
  await seedFundDetails(payload)

  payload.logger.info({ migration }, 'CMS baseline sync completed')
}

main()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
