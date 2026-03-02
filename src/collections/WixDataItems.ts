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
    useAsTitle: 'wixItemId',
    defaultColumns: ['wixCollectionId', 'wixItemId', 'updatedAt'],
  },
  fields: [
    {
      name: 'wixCollectionId',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'wixItemId',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'wixUpdatedAt',
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
      fields: ['wixCollectionId', 'wixItemId'],
      unique: true,
    },
  ],
}
