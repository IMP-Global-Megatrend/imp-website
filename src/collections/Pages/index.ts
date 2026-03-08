import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { Archive } from '../../blocks/ArchiveBlock/config'
import { CallToAction } from '../../blocks/CallToAction/config'
import { Content } from '../../blocks/Content/config'
import { FormBlock } from '../../blocks/Form/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { hero } from '@/heros/config'
import { slugField } from 'payload'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  // This config controls what's populated by default when a page is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'pages'>
  defaultPopulate: {
    title: true,
    slug: true,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'pages',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'pages',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [hero],
          label: 'Hero',
        },
        {
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blocks: [CallToAction, Content, MediaBlock, Archive, FormBlock],
              required: true,
              admin: {
                initCollapsed: true,
              },
            },
          ],
          label: 'Content',
        },
        {
          fields: [
            {
              name: 'aboutUsVideo',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Optional video file from Media Library for /about-us.',
              },
            },
          ],
          label: 'About Us',
        },
        {
          fields: [
            {
              name: 'heroCtaLabel',
              type: 'text',
              admin: {
                description: 'Homepage CTA label used in the hero section.',
              },
            },
            {
              name: 'heroCtaHref',
              type: 'text',
              admin: {
                description: 'Homepage CTA URL used in the hero section.',
              },
            },
            {
              name: 'homeDownloads',
              type: 'group',
              fields: [
                {
                  name: 'factsheetUsd',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description: 'Homepage download: Factsheet USD (PDF media asset).',
                  },
                },
                {
                  name: 'factsheetChfHedged',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description: 'Homepage download: Factsheet CHF Hedged (PDF media asset).',
                  },
                },
                {
                  name: 'fundCommentary',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description: 'Homepage download: Fund Commentary (PDF media asset).',
                  },
                },
                {
                  name: 'presentation',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description: 'Homepage download: Presentation (PDF media asset).',
                  },
                },
              ],
            },
          ],
          label: 'Home',
        },
        {
          fields: [
            {
              name: 'contactCompanyName',
              type: 'text',
            },
            {
              name: 'contactAddress',
              type: 'textarea',
            },
            {
              name: 'contactPhone',
              type: 'text',
            },
            {
              name: 'contactEmail',
              type: 'text',
            },
            {
              name: 'contactWebsite',
              type: 'text',
            },
            {
              name: 'contactConsentText',
              type: 'textarea',
            },
          ],
          label: 'Contact',
        },
        {
          fields: [
            {
              name: 'newsletterIntroTitle',
              type: 'text',
            },
            {
              name: 'newsletterIntroBody',
              type: 'textarea',
            },
            {
              name: 'newsletterConsentText',
              type: 'textarea',
            },
            {
              name: 'newsletterSubmitLabel',
              type: 'text',
            },
          ],
          label: 'Newsletter',
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'sourceId',
      type: 'text',
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'sourceUpdatedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    slugField(),
  ],
  hooks: {
    afterChange: [revalidatePage],
    beforeChange: [populatePublishedAt],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
  indexes: [
    {
      fields: ['sourceId'],
      unique: true,
    },
  ],
}
