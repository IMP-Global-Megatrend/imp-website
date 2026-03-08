import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'

export const PortfolioInvestmentProcessItems: CollectionConfig = {
  slug: 'portfolio-investment-process-items',
  labels: {
    singular: 'Portfolio Investment Process Item',
    plural: 'Portfolio Investment Process Items',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['sortOrder', 'title', 'updatedAt'],
    group: 'Portfolio Strategy',
  },
  access: {
    create: authenticated,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'sortOrder',
      type: 'number',
      required: true,
      index: true,
    },
  ],
  defaultSort: 'sortOrder',
  timestamps: true,
}
