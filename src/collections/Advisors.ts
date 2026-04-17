import type { CollectionConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { revalidateAboutUsPage, revalidateAboutUsPageOnDelete } from '@/hooks/revalidateAboutUsPage'

export const Advisors: CollectionConfig = {
  slug: 'advisors',
  labels: {
    singular: 'Advisor',
    plural: 'Advisors',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['sortOrder', 'name', 'roleTitle', 'updatedAt'],
    group: 'About Us',
  },
  access: {
    create: authenticated,
    read: anyone,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'roleTitle',
      type: 'text',
      required: true,
      admin: {
        description: 'Short role line shown under the name (e.g. “Senior Advisor to the Fund”).',
      },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Portrait for the Advisory Board section.',
      },
    },
    {
      name: 'bio',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Biography text. Use blank lines between paragraphs for spacing on the site.',
      },
    },
    {
      name: 'linkedinUrl',
      type: 'text',
      admin: {
        description: 'Optional full LinkedIn profile URL.',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Used when loading advisors without an explicit order on the About Us page.',
        step: 1,
      },
    },
  ],
  defaultSort: 'sortOrder',
  hooks: {
    afterChange: [revalidateAboutUsPage],
    afterDelete: [revalidateAboutUsPageOnDelete],
  },
  timestamps: true,
}
