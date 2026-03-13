import type { Metadata } from 'next'
import { getServerSideURL } from '@/utilities/getURL'
import { ogPageImagePath } from '@/utilities/ogImage'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description:
    'Investing in the structural forces that shape tomorrow through a high-conviction thematic portfolio.',
  images: [
    {
      url: `${getServerSideURL()}${ogPageImagePath('home')}`,
    },
  ],
  siteName: 'IMP Global Megatrend Umbrella Fund',
  title: 'IMP Global Megatrend Umbrella Fund',
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
