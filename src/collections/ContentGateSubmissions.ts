import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'

export const ContentGateSubmissions: CollectionConfig = {
  slug: 'content-gate-submissions',
  admin: {
    useAsTitle: 'selectedCountry',
    defaultColumns: ['selectedCountry', 'ipCountry', 'ipAddress', 'createdAt'],
    group: 'Forms',
  },
  access: {
    create: authenticated,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'selectedCountry',
      type: 'text',
      required: true,
    },
    {
      name: 'ipCountry',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'ipAddress',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'userAgent',
      type: 'textarea',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'path',
      type: 'text',
    },
    {
      name: 'submittedAt',
      type: 'date',
      admin: {
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
  timestamps: true,
}
