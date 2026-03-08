import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'

export const PortfolioStrategySteps: CollectionConfig = {
  slug: 'portfolio-strategy-steps',
  labels: {
    singular: 'Portfolio Strategy Step',
    plural: 'Portfolio Strategy Steps',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['sortOrder', 'title', 'page', 'updatedAt'],
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
      name: 'page',
      type: 'relationship',
      relationTo: 'pages',
      required: true,
      index: true,
      admin: {
        description: 'Page this step belongs to (use portfolio-strategy).',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        description: 'Step illustration image.',
      },
    },
    {
      name: 'imageSrc',
      type: 'text',
      admin: {
        description: 'Optional image URL/path fallback when no media relation is selected.',
      },
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      admin: {
        description: 'Content blocks shown inside this strategy step section.',
      },
      fields: [
        {
          name: 'heading',
          type: 'text',
          required: true,
        },
        {
          name: 'body',
          type: 'textarea',
          required: true,
        },
        {
          name: 'sortOrder',
          type: 'number',
          required: true,
        },
      ],
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
