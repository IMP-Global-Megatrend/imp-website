import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'

export const HomeMegatrendCards: CollectionConfig = {
  slug: 'home-megatrend-cards',
  labels: {
    singular: 'Home Megatrend Card',
    plural: 'Home Megatrend Cards',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['sortOrder', 'title', 'page', 'updatedAt'],
    group: 'Home',
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
        description: 'Page this card belongs to (use home).',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
    },
    {
      name: 'tickers',
      type: 'array',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'ticker',
          type: 'text',
          required: true,
        },
        {
          name: 'company',
          type: 'text',
          required: true,
        },
        {
          name: 'sortOrder',
          type: 'number',
        },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Preferred card image from Media Library.',
      },
    },
    {
      name: 'imageSrc',
      type: 'text',
      admin: {
        description: 'Optional image source fallback when no media relation is set.',
      },
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
