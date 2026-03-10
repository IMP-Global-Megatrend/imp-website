import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import {
  revalidatePerformanceAnalysisPage,
  revalidatePerformanceAnalysisPageOnDelete,
} from '@/hooks/revalidatePerformanceAnalysisPage'

export const PerformanceNavPoints: CollectionConfig = {
  slug: 'performance-nav-points',
  labels: {
    singular: 'Performance NAV Point',
    plural: 'Performance NAV Points',
  },
  admin: {
    useAsTitle: 'asOf',
    defaultColumns: ['shareClass', 'asOf', 'nav', 'updatedAt'],
    group: 'Performance',
  },
  access: {
    create: authenticated,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'shareClass',
      type: 'select',
      required: true,
      options: [
        { label: 'USD', value: 'usd' },
        { label: 'CHF', value: 'chf' },
      ],
      index: true,
    },
    {
      name: 'asOf',
      type: 'date',
      required: true,
      index: true,
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'nav',
      type: 'number',
      required: true,
      admin: {
        step: 0.01,
      },
    },
    {
      name: 'sourceCollection',
      type: 'text',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'sourceItemId',
      type: 'text',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
  ],
  indexes: [
    {
      fields: ['shareClass', 'asOf'],
      unique: true,
    },
  ],
  hooks: {
    afterChange: [revalidatePerformanceAnalysisPage],
    afterDelete: [revalidatePerformanceAnalysisPageOnDelete],
  },
  timestamps: true,
}
