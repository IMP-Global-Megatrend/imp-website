import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateFooter } from './hooks/revalidateFooter'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 7,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Footer/RowLabel#RowLabel',
        },
      },
    },
    {
      name: 'downloads',
      type: 'group',
      fields: [
        {
          name: 'factsheetUsd',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'PDF media asset for Factsheet USD.',
          },
        },
        {
          name: 'factsheetChfHedged',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'PDF media asset for Factsheet CHF Hedged.',
          },
        },
        {
          name: 'fundCommentary',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'PDF media asset for Fund Commentary.',
          },
        },
        {
          name: 'presentation',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'PDF media asset for Presentation.',
          },
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}
