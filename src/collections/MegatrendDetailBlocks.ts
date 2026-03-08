import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'

export const MegatrendDetailBlocks: CollectionConfig = {
  slug: 'megatrend-detail-blocks',
  labels: {
    singular: 'Megatrend Detail Block',
    plural: 'Megatrend Detail Blocks',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['sortOrder', 'title', 'anchor', 'page', 'updatedAt'],
    group: 'Megatrends',
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
        description: 'Page this megatrend block belongs to (use megatrends).',
      },
    },
    {
      name: 'anchor',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'subtitle',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'text',
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
      name: 'conclusion',
      type: 'textarea',
      required: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Megatrend illustration image.',
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
      name: 'sortOrder',
      type: 'number',
      required: true,
      index: true,
    },
  ],
  defaultSort: 'sortOrder',
  timestamps: true,
}
