import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import {
  revalidatePerformanceAnalysisPage,
  revalidatePerformanceAnalysisPageOnDelete,
} from '@/hooks/revalidatePerformanceAnalysisPage'

function buildPerformanceShareClassCollection(config: {
  slug: string
  label: string
  defaultName: string
}): CollectionConfig {
  return {
    slug: config.slug,
    labels: {
      singular: config.label,
      plural: config.label,
    },
    admin: {
      useAsTitle: 'name',
      defaultColumns: ['name', 'nav', 'perfYTD', 'asOf', 'updatedAt'],
      group: 'Performance',
    },
    access: {
      create: authenticated,
      read: authenticated,
      update: authenticated,
      delete: authenticated,
    },
    hooks: {
      afterChange: [revalidatePerformanceAnalysisPage],
      afterDelete: [revalidatePerformanceAnalysisPageOnDelete],
    },
    fields: [
      {
        name: 'name',
        type: 'text',
        required: true,
        defaultValue: config.defaultName,
        admin: {
          description: 'Display name for this share class dataset.',
        },
      },
      { name: 'nav', type: 'text', required: true },
      { name: 'perfYTD', type: 'text', required: true },
      { name: 'asOf', type: 'text', required: true },
      { name: 'sharpe', type: 'text', required: true },
      { name: 'volatility', type: 'text', required: true },
      { name: 'sortino', type: 'text', required: true },
      { name: 'downsideRisk', type: 'text', required: true },
      {
        name: 'fundDetails',
        type: 'array',
        minRows: 1,
        fields: [
          { name: 'label', type: 'text', required: true },
          { name: 'value', type: 'text', required: true },
          { name: 'sortOrder', type: 'number', required: true },
        ],
      },
    ],
    timestamps: true,
  }
}

export const PerformanceUsdShareClassData = buildPerformanceShareClassCollection({
  slug: 'performance-usd-share-class-data',
  label: 'Performance USD Share Class Data',
  defaultName: 'USD Share Class',
})

export const PerformanceChfShareClassData = buildPerformanceShareClassCollection({
  slug: 'performance-chf-share-class-data',
  label: 'Performance CHF Share Class Data',
  defaultName: 'CHF Hedged Share Class',
})
