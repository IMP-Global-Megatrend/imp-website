jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
  unstable_cache: (fn: () => Promise<unknown>) => async () => await fn(),
}))

import { ContactSubmissions } from '../ContactSubmissions'
import { ContentGateSubmissions } from '../ContentGateSubmissions'
import { HomeMegatrendCards } from '../HomeMegatrendCards'
import { MegatrendDetailBlocks } from '../MegatrendDetailBlocks'
import { NewsletterSubscriptions } from '../NewsletterSubscriptions'
import { PerformanceChfShareClassData, PerformanceUsdShareClassData } from '../PerformanceShareClassCollections'
import { PerformanceNavPoints } from '../PerformanceNavPoints'
import {
  PortfolioGeographicAllocations,
  PortfolioMegatrendAllocations,
  PortfolioSectorAllocations,
  PortfolioTopHoldings,
} from '../PortfolioStrategyChartCollections'
import { PortfolioInvestmentProcessItems } from '../PortfolioInvestmentProcessItems'
import { PortfolioStrategySteps } from '../PortfolioStrategySteps'
import { ResendWebhookEvents } from '../ResendWebhookEvents'
import { WixCollections } from '../SourceCollections'
import { Users } from '../Users'

const collectionConfigs = [
  ContactSubmissions,
  ContentGateSubmissions,
  HomeMegatrendCards,
  MegatrendDetailBlocks,
  NewsletterSubscriptions,
  ResendWebhookEvents,
  Users,
  PerformanceNavPoints,
  PerformanceUsdShareClassData,
  PerformanceChfShareClassData,
  PortfolioMegatrendAllocations,
  PortfolioGeographicAllocations,
  PortfolioSectorAllocations,
  PortfolioTopHoldings,
  PortfolioStrategySteps,
  PortfolioInvestmentProcessItems,
]

describe('Payload collection configs (lightweight modules)', () => {
  it.each(collectionConfigs)('$slug defines access and fields', (config) => {
    expect(config.slug).toBeTruthy()
    expect(config.access).toBeDefined()
    expect(config.fields?.length).toBeGreaterThan(0)
  })

  it('exports Wix CMS mirror collections with unique slugs', () => {
    expect(WixCollections.length).toBeGreaterThan(0)
    const slugs = WixCollections.map((c) => c.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const c of WixCollections) {
      expect(c.access).toBeDefined()
    }
  })
})
