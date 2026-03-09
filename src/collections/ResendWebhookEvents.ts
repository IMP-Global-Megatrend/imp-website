import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'

export const ResendWebhookEvents: CollectionConfig = {
  slug: 'resend-webhook-events',
  admin: {
    useAsTitle: 'eventType',
    defaultColumns: ['eventType', 'emailId', 'subject', 'webhookCreatedAt', 'receivedAt'],
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
      name: 'eventType',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'webhookCreatedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        readOnly: true,
      },
    },
    {
      name: 'emailId',
      type: 'text',
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'from',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'to',
      type: 'array',
      admin: {
        readOnly: true,
      },
      fields: [
        {
          name: 'address',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'subject',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'svixId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'payload',
      type: 'json',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'receivedAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        readOnly: true,
      },
    },
  ],
  timestamps: true,
}
