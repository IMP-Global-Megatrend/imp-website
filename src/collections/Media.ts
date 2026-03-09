import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

function buildSupabasePublicMediaUrl(filename?: string | null): string | null {
  if (!filename) return null

  const endpoint = process.env.S3_ENDPOINT
  const bucket = process.env.S3_BUCKET
  if (!endpoint || !bucket) return null

  try {
    const endpointUrl = new URL(endpoint)
    const normalizedFilename = filename.trim()
    if (!normalizedFilename) return null

    return `${endpointUrl.origin}/storage/v1/object/public/${bucket}/${encodeURIComponent(normalizedFilename)}`
  } catch {
    return null
  }
}

export const Media: CollectionConfig = {
  slug: 'media',
  folders: true,
  admin: {
    defaultColumns: ['filename', 'alt', 'url', 'storageUrl', 'updatedAt'],
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description: 'Required alternative text used by screen readers and SEO.',
      },
    },
    {
      name: 'sourceUrl',
      type: 'text',
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'storageUrl',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Direct Supabase public object URL for this asset.',
      },
      hooks: {
        afterRead: [
          ({ value, siblingData }) =>
            typeof value === 'string' && value.trim().length > 0
              ? value
              : buildSupabasePublicMediaUrl((siblingData as { filename?: string })?.filename) || '',
        ],
      },
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        const storageUrl = buildSupabasePublicMediaUrl((data as { filename?: string })?.filename)
        if (!storageUrl) return data

        return {
          ...data,
          storageUrl,
        }
      },
    ],
  },
  upload: {
    disableLocalStorage: true,
    adminThumbnail: ({ doc }) => {
      const mediaDoc = doc as {
        sizes?: {
          thumbnail?: {
            filename?: string | null
            url?: string | null
          } | null
        } | null
        filename?: string | null
        url?: string | null
        storageUrl?: string | null
      }

      const thumbnailPublicUrl = buildSupabasePublicMediaUrl(mediaDoc.sizes?.thumbnail?.filename)
      const originalPublicUrl = buildSupabasePublicMediaUrl(mediaDoc.filename)

      return (
        thumbnailPublicUrl ||
        originalPublicUrl ||
        mediaDoc.storageUrl ||
        mediaDoc.sizes?.thumbnail?.url ||
        mediaDoc.url ||
        ''
      )
    },
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
      },
      {
        name: 'small',
        width: 600,
      },
      {
        name: 'medium',
        width: 900,
      },
      {
        name: 'large',
        width: 1400,
      },
      {
        name: 'xlarge',
        width: 1920,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
}
