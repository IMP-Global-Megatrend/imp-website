import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import {
  revalidatePortfolioStrategyPage,
  revalidatePortfolioStrategyPageOnDelete,
} from '@/hooks/revalidatePortfolioStrategyPage'

function buildPortfolioChartCollection(config: {
  slug: string
  singular: string
  plural: string
  hideColorInAdmin?: boolean
  includeColorField?: boolean
}): CollectionConfig {
  const hideColorInAdmin = Boolean(config.hideColorInAdmin)
  const includeColorField = config.includeColorField !== false
  const fields: CollectionConfig['fields'] = [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'weight',
      type: 'number',
      required: true,
      admin: {
        step: 0.1,
        description: 'Allocation percentage value (e.g. 24.2).',
      },
    },
    {
      name: 'icon',
      type: 'text',
      admin: {
        description:
          'Optional Phosphor icon key for list markers (e.g. cpu, heartbeat, bank, lightning).',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      required: true,
      index: true,
    },
  ]

  if (includeColorField) {
    fields.splice(2, 0, {
      name: 'color',
      type: 'text',
      required: true,
      admin: {
        description: 'Hex color used in the chart legend and donut slice.',
        hidden: hideColorInAdmin,
      },
    })
  }

  return {
    slug: config.slug,
    labels: {
      singular: config.singular,
      plural: config.plural,
    },
    admin: {
      useAsTitle: 'name',
      defaultColumns: !includeColorField || hideColorInAdmin
        ? ['sortOrder', 'name', 'weight', 'icon', 'updatedAt']
        : ['sortOrder', 'name', 'weight', 'color', 'icon', 'updatedAt'],
      group: 'Portfolio Strategy',
    },
    access: {
      create: authenticated,
      read: authenticated,
      update: authenticated,
      delete: authenticated,
    },
    hooks: {
      afterChange: [revalidatePortfolioStrategyPage],
      afterDelete: [revalidatePortfolioStrategyPageOnDelete],
    },
    fields,
    defaultSort: 'sortOrder',
    timestamps: true,
  }
}

export const PortfolioMegatrendAllocations = buildPortfolioChartCollection({
  slug: 'portfolio-megatrend-allocations',
  singular: 'Portfolio Megatrend Allocation',
  plural: 'Portfolio Megatrend Allocations',
})

export const PortfolioGeographicAllocations = buildPortfolioChartCollection({
  slug: 'portfolio-geographic-allocations',
  singular: 'Portfolio Geographic Allocation',
  plural: 'Portfolio Geographic Allocations',
})

export const PortfolioSectorAllocations = buildPortfolioChartCollection({
  slug: 'portfolio-sector-allocations',
  singular: 'Portfolio Sector Allocation',
  plural: 'Portfolio Sector Allocations',
})

export const PortfolioTopHoldings = buildPortfolioChartCollection({
  slug: 'portfolio-top-holdings',
  singular: 'Portfolio Top Holding',
  plural: 'Portfolio Top Holdings',
})
