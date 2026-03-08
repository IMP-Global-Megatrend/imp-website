// @ts-nocheck
import dotenv from 'dotenv'
import path from 'node:path'
import fallbacks from '@/constants/fallbacks.json'
import { getCMSPerformancePageData } from '@/app/(frontend)/_components/getCMSPageBySlug'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

type ShareClassInput = {
  name: string
  nav: string
  perfYTD: string
  asOf: string
  sharpe: string
  volatility: string
  sortino: string
  downsideRisk: string
  fundDetails: Array<[string, string]>
}

function normalizeShareClassInput(
  name: string,
  cmsData: {
    nav?: string
    perfYTD?: string
    asOf?: string
    sharpe?: string
    volatility?: string
    sortino?: string
    downsideRisk?: string
    fundDetails?: Array<[string, string]>
  } | null | undefined,
  fallbackData: {
    nav: string
    perfYTD: string
    asOf: string
    sharpe: string
    volatility: string
    sortino: string
    downsideRisk: string
    fundDetails: Array<[string, string]>
  },
): ShareClassInput {
  return {
    name,
    nav: (cmsData?.nav || fallbackData.nav || '').trim(),
    perfYTD: (cmsData?.perfYTD || fallbackData.perfYTD || '').trim(),
    asOf: (cmsData?.asOf || fallbackData.asOf || '').trim(),
    sharpe: (cmsData?.sharpe || fallbackData.sharpe || '').trim(),
    volatility: (cmsData?.volatility || fallbackData.volatility || '').trim(),
    sortino: (cmsData?.sortino || fallbackData.sortino || '').trim(),
    downsideRisk: (cmsData?.downsideRisk || fallbackData.downsideRisk || '').trim(),
    fundDetails: (cmsData?.fundDetails?.length ? cmsData.fundDetails : fallbackData.fundDetails).map((row) => [
      (row[0] || '').trim(),
      (row[1] || '').trim(),
    ]),
  }
}

async function upsertShareClassDoc(args: {
  payload: Awaited<ReturnType<(typeof import('payload'))['getPayload']>>
  collection: 'performance-usd-share-class-data' | 'performance-chf-share-class-data'
  data: ShareClassInput
}) {
  const existingResult = await args.payload.find({
    collection: args.collection,
    limit: 1,
    pagination: false,
    depth: 0,
  })

  const docData = {
    name: args.data.name,
    nav: args.data.nav,
    perfYTD: args.data.perfYTD,
    asOf: args.data.asOf,
    sharpe: args.data.sharpe,
    volatility: args.data.volatility,
    sortino: args.data.sortino,
    downsideRisk: args.data.downsideRisk,
    fundDetails: args.data.fundDetails.map(([label, value], index) => ({
      label,
      value,
      sortOrder: index + 1,
    })),
  }

  if (!existingResult.docs?.[0]) {
    await args.payload.create({
      collection: args.collection,
      depth: 0,
      data: docData,
    })
    return 'created'
  }

  await args.payload.update({
    collection: args.collection,
    id: existingResult.docs[0].id,
    depth: 0,
    data: docData,
  })
  return 'updated'
}

async function main() {
  const [{ default: config }, { getPayload }] = await Promise.all([
    import('@payload-config'),
    import('payload'),
  ])
  const payload = await getPayload({ config })

  const pageData = await getCMSPerformancePageData()
  const usdFallback = {
    ...fallbacks.performance.shareClassDetails.usd,
    fundDetails: fallbacks.performance.shareClassDetails.usd.fundDetails as Array<[string, string]>,
  }
  const chfFallback = {
    ...fallbacks.performance.shareClassDetails.chf,
    fundDetails: fallbacks.performance.shareClassDetails.chf.fundDetails as Array<[string, string]>,
  }

  const usdInput = normalizeShareClassInput('USD Share Class', pageData?.usd, usdFallback)
  const chfInput = normalizeShareClassInput('CHF Hedged Share Class', pageData?.chf, chfFallback)

  const [usdResult, chfResult] = await Promise.all([
    upsertShareClassDoc({
      payload,
      collection: 'performance-usd-share-class-data',
      data: usdInput,
    }),
    upsertShareClassDoc({
      payload,
      collection: 'performance-chf-share-class-data',
      data: chfInput,
    }),
  ])

  console.log(
    JSON.stringify(
      {
        usd: usdResult,
        chf: chfResult,
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
