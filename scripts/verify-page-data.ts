// @ts-nocheck
import { getHomeCMSContent } from '@/app/(frontend)/_components/getHomeCMSContent'
import {
  getCMSFundDetails,
  getCMSFundIntroQuotes,
  getCMSFundShareClassMeta,
  getCMSPerformanceNavSeries,
  getCMSPerformancePageData,
} from '@/app/(frontend)/_components/getCMSPageBySlug'

async function main() {
  const [home, fundDetails, fundQuotes, fundShareMeta, perfData, perfSeries] = await Promise.all([
    getHomeCMSContent(),
    getCMSFundDetails(),
    getCMSFundIntroQuotes(),
    getCMSFundShareClassMeta(),
    getCMSPerformancePageData(),
    getCMSPerformanceNavSeries(),
  ])

  const report = {
    home: {
      trends: home.trends.length,
      regulatoryItems: home.regulatoryItems.length,
      downloads: home.downloads.length,
      hasExploreCardTitle: Boolean(home.exploreMegatrendsCard.title),
      hasExploreCardImage: Boolean(home.exploreMegatrendsCard.imageUrl),
      hasRegulatoryNoticeTitle: Boolean(home.regulatoryNotice.title),
      hasRegulatoryNoticeBody: Boolean(home.regulatoryNotice.body),
    },
    fund: {
      detailsCount: fundDetails?.length ?? 0,
      hasIntroQuote: Boolean(fundQuotes?.first),
      hasUsdMeta: Boolean(fundShareMeta?.usd.isinValue && fundShareMeta?.usd.wknValue),
      hasChfMeta: Boolean(fundShareMeta?.chf.isinValue && fundShareMeta?.chf.wknValue),
    },
    performance: {
      hasPageTitle: Boolean(perfData?.pageTitle),
      hasAnnualTitle: Boolean(perfData?.annualPerformanceTitle),
      hasUsdNav: Boolean(perfData?.usd?.nav),
      hasChfNav: Boolean(perfData?.chf?.nav),
      usdSeriesPoints: perfSeries.usd.length,
      chfSeriesPoints: perfSeries.chf.length,
    },
  }

  console.log(JSON.stringify(report, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
