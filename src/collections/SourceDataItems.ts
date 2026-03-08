import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'

export const WixDataItems: CollectionConfig = {
  slug: 'wix-data-items',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'sourceItemId',
    defaultColumns: ['sourceCollectionId', 'sourceItemId', 'updatedAt'],
  },
  fields: [
    {
      name: 'sourceCollectionId',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'sourceItemId',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'sourceUpdatedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'data',
      type: 'json',
      required: true,
    },
  ],
  indexes: [
    {
      fields: ['sourceCollectionId', 'sourceItemId'],
      unique: true,
    },
  ],
}
